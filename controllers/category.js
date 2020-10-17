import moment from "moment";

import CategoryModel from "../models/category.model";

//get list Category

export const showAllCategory = async (req, res) => {
  const listCategorys = await CategoryModel.find();

  res.status(200).json({
    listCategory: listCategorys,
  });
};

export const createCategory = async (req, res) => {
  let errors = [];

  !req.body.name && errors.push("Name is Required");

  const Category = await CategoryModel.findOne({ name: req.body.name }); // tìm ra Category có mail truyền vào

  Category && errors.push("name is Duplicate");

  if (!!errors.length) {
    res.status(500).json({
      errors: errors,
    });
    return;
  }

  const newCategory = new CategoryModel({
    ...req.body,
    courses: [],
    date_create: moment().format(),
  });
  try {
    await newCategory.save();
    res.status(201).json({ newCategory: newCategory });
  } catch (error) {
    error.status = 400;
    next(error);
  }
};

export const detailCategory = async (req, res, next) => {
  const Category = await CategoryModel.findOne({ _id: req.params.id }); // tìm ra Category có id truyền vào

  if (!Category) {
    next({ status: 404 });
    return;
  }

  res.status(200).json({ Category });
};

export const updateCategory = async (req, res, next) => {
  const id = req.params.id;

  const Category = await CategoryModel.findOne({ _id: id });

  if (!Category) {
    next({ status: 404 });
    return;
  }

  CategoryModel.findOneAndUpdate({ _id: id }, { ...req.body }, (err, doc) => {
    if (err) {
      err.status = 500;
      return next(err);
    }
    return res.status(200).json({ success: true });
  });
};

export const deleteCategory = (req, res, next) => {
  const id = req.params.id;

  CategoryModel.findOneAndDelete({ _id: id }, (err, doc) => {
    if (err) {
      err.status = 500;
      return next(err);
    }
    return res.status(200).json({ success: true });
  });
};
