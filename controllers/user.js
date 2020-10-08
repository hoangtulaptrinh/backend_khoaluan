import find from "lodash/find";
import findIndex from "lodash/findIndex";
import jwt from "jsonwebtoken";
import moment from "moment";

import CourseModel from "../models/course.model.js";
import UserModel from "../models/user.model";

const SECRET_KEY = "hoangtulaptrinh";

// gen token

const getSignedToken = (user) =>
  jwt.sign({ ...user }, SECRET_KEY, { expiresIn: "100000h" });

// gentoken

//get list user

export const searchUser = (req, res) => {
  // const params = req.query;
  // const userData = { name: params.name, date_of_birth: params.date_of_birth };
  // !!find(listUser, userData) && res.send(`<div><p>My name is ${params.name}</p><p>My age is ${params.date_of_birth}</p></div>`);
  // !find(listUser, userData) && res.send('<h1>Not Found</h1>');
};

export const showAllUser = async (req, res) => {
  const listUsers = await UserModel.find();

  res.status(200).json({
    listUser: listUsers,
  });
};

export const createUser = async (req, res) => {
  let errors = [];

  !req.body.email && errors.push("Email is Required");
  !req.body.password && errors.push("Password is Required");
  !req.body.name && errors.push("Name is Required");
  !req.body.date_of_birth && errors.push("Date_of_birth is Required");
  !req.body.phone_number && errors.push("Phone_number is Required");

  const user = await UserModel.findOne({ email: req.body.email }); // tìm ra user có mail truyền vào

  user && errors.push("Email is Duplicate");

  if (!!errors.length) {
    res.status(500).json({
      errors: errors,
    });
    return;
  }

  const newUser = new UserModel({
    ...req.body,
    money: 0,
    role: "normal",
    course: null,
    care: [],
    date_create: moment().format(),
  });
  try {
    await newUser.save();
    const token = getSignedToken(newUser);
    res.status(201).json({ newUser: { ...newUser._doc, token: token } });
  } catch (error) {
    error.status = 400;
    next(error);
  }
};

export const detailUser = async (req, res, next) => {
  const user = await UserModel.findOne({ _id: req.params.id }); // tìm ra user có id truyền vào

  if (!user) {
    next({ status: 404 });
    return;
  }

  res.status(200).json({ user });
};

export const changePassword = async (req, res, next) => {
  const id = req.params.id;
  const old_password = req.body.old_password;
  const new_password = req.body.new_password;

  try {
    const user = await UserModel.findOne({ _id: id }); // tìm ra user có id truyền vào

    let errors = [];

    !req.body.old_password && errors.push("Old_password is Required");
    !req.body.new_password && errors.push("New_password is Required");

    if (!!errors.length) {
      res.status(500).json({
        errors: errors,
      });
      return;
    }

    if (user.password !== old_password) {
      res.status(500).json({
        errors: "Old password is incorrect",
      });
      return;
    }

    await UserModel.updateOne(
      { _id: id },
      { password: new_password },
      (err, doc) => {
        if (err) {
          err.status = 500;
          return next(err);
        }
        return res.status(200).json({ success: true });
      }
    );
  } catch (error) {
    next({ status: 404 });
    return;
  }
};

export const updateInfo = async (req, res, next) => {
  const id = req.params.id;

  const user = await UserModel.findOne({ _id: id });

  if (!user) {
    next({ status: 404 });
    return;
  }

  UserModel.findOneAndUpdate({ _id: id }, { ...req.body }, (err, doc) => {
    if (err) {
      err.status = 500;
      return next(err);
    }
    return res.status(200).json({ success: true });
  });
};

export const deleteUser = (req, res, next) => {
  const id = req.params.id;

  UserModel.findOneAndDelete({ _id: id }, (err, doc) => {
    if (err) {
      err.status = 500;
      return next(err);
    }
    return res.status(200).json({ success: true });
  });
};

export const buyCourse = async (req, res, next) => {
  const id = req.params.id;

  const idCourse = req.body.idCourse;

  const user = await UserModel.findOne({ _id: id }, (err, doc) => {
    if (err) {
      next({ status: 404 });
      return;
    }
  });

  const course = await CourseModel.findOne({ _id: idCourse }, (err, doc) => {
    if (err) {
      next({ status: 404 });
      return;
    }
  });

  if (Number(user.money) < Number(course.cost)) {
    res.status(500).json({
      errors: "You don't have enough money",
    });
    return;
  }

  let courseUpdate;

  !user.course &&
    (courseUpdate = [
      {
        id: idCourse,
        name: course.name,
        lesson: course.lesson,
        progress: 0,
        cost: Number(course.cost),
        date_buy: moment().format(),
      },
    ]); // nếu ban đầu chưa mua bài nào thì cho vào array danh sách course

  if (!!user.course && !!user.course.length) {
    if (!find(user.course, { id: idCourse })) {
      // nếu user chưa mua bài học đó thì thêm bài học vào
      courseUpdate = [
        ...user.course,
        {
          id: idCourse,
          name: course.name,
          lesson: course.lesson,
          progress: 0,
          cost: Number(course.cost),
          date_buy: moment().format(),
        },
      ];
    } else {
      // nếu user đã mua bài học đó thì báo lỗi lại cho client
      res.status(500).json({
        errors: "You have already bought this lesson",
      });
      return;
    }
  }

  UserModel.findOneAndUpdate(
    { _id: id },
    {
      course: courseUpdate,
      money: String(Number(user.money) - Number(course.cost)),
    },
    (err, doc) => {
      if (err) {
        err.status = 500;
        return next(err);
      }
      return res.status(200).json({ success: true });
    }
  );
};

export const updateProcessCourse = async (req, res, next) => {
  const id = req.params.id;

  const course = req.body.course;

  const infoCourse = await CourseModel.findOne(
    { _id: course.id },
    (err, doc) => {
      if (err) {
        next({ status: 404 });
        return;
      }
    }
  );

  const user = await UserModel.findOne({ _id: id }, (err, doc) => {
    if (err) {
      next({ status: 404 });
      return;
    }
  });

  const cloneUserCourse = [...user.course];
  const indexCourse = findIndex(user.course, { id: course.id });

  if (indexCourse < 0) {
    // nếu truyền sai id course lên thì báo lỗi
    next({ status: 404 });
    return;
  }

  course.name = infoCourse.name;
  course.lesson = infoCourse.lesson;

  cloneUserCourse.splice(indexCourse, 1, course);

  const courseUpdate = [...cloneUserCourse];

  UserModel.findOneAndUpdate(
    { _id: id },
    { course: courseUpdate },
    (err, doc) => {
      if (err) {
        err.status = 500;
        return next(err);
      }
      return res.status(200).json({ success: true });
    }
  );
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email: email });

  if (!user || password !== user.password) {
    res.status(403).json({
      errors: "Sai Tài Khoản Hoặc Mật Khẩu",
    });
    return;
  }

  res.status(200).json({
    user: user,
  });
};
