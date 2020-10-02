import find from "lodash/find";
import findIndex from "lodash/findIndex";
import multer from "multer";
import path from "path";

import CourseModel from "../models/course.model";
import TopicModel from "../models/topic.model";

export const showAllCourse = async (req, res) => {
  const listCourse = await CourseModel.find();

  res.status(200).json({
    listCourse: listCourse,
  });
};

// multer

const diskStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    // Định nghĩa nơi file upload sẽ được lưu lại
    file.fieldname === "image" && callback(null, "uploads/images");
    file.fieldname === "outline" && callback(null, "uploads/outlines");
    file.fieldname === "video" && callback(null, "uploads/videos");
  },
  filename: (req, file, callback) => {
    // image
    if (file.fieldname === "image") {
      // ở đây các bạn có thể làm bất kỳ điều gì với cái file nhé.
      // Mình ví dụ chỉ cho phép tải lên các loại ảnh png & jpg

      const math = ["image/png", "image/jpeg"];
      if (math.indexOf(file.mimetype) === -1) {
        const errorMess = `The file <strong>${file.originalname}</strong> is invalid. Only allowed to upload image jpeg or png.`;
        return callback(errorMess, null);
      }
      // Tên của file thì mình nối thêm một cái nhãn thời gian để đảm bảo không bị trùng.
      const filename = `${Date.now()}-hoangtulaptrinh-${file.originalname}`;
      callback(null, filename);
    }

    // outline
    if (file.fieldname === "outline") {
      // ở đây các bạn có thể làm bất kỳ điều gì với cái file nhé.

      // Tên của file thì mình nối thêm một cái nhãn thời gian để đảm bảo không bị trùng.
      const filename = `${Date.now()}-hoangtulaptrinh-${file.originalname}`;
      callback(null, filename);
    }

    if (file.fieldname === "video") {
      // ở đây các bạn có thể làm bất kỳ điều gì với cái file nhé.

      // Tên của file thì mình nối thêm một cái nhãn thời gian để đảm bảo không bị trùng.
      const filename = `${Date.now()}-hoangtulaptrinh-${file.originalname}`;
      callback(null, filename);
    }
  },
});

// Khởi tạo middleware uploadFile với cấu hình như ở trên,

const uploadFile = multer({ storage: diskStorage }).fields([
  {
    name: "image",
    maxCount: 1,
  },
  {
    name: "outline",
    maxCount: 1,
  },
  {
    name: "video",
    maxCount: 1,
  },
]);

// multer

export const createCourse = async (req, res, next) => {
  let errors = [];

  uploadFile(req, res, async (error) => {
    !req.body.name && errors.push("Name is Required"); // multer sẽ gắn các trường bt (string,number,object) vào req.body, còn dạng file (image,txt,video) thì gắn vào req.file
    !req.body.cost && errors.push("Cost is Required");
    !req.body.intro && errors.push("Intro is Required");
    !req.body.references && errors.push("References is Required");
    !req.files.image && errors.push("Image is Required");
    !req.files.outline && errors.push("Outline is Required");

    const course = await CourseModel.findOne({ name: req.body.name }); // tìm ra course có name truyền vào

    course && errors.push("Course name is Duplicate");

    if (!!errors.length) {
      res.status(500).json({
        errors: errors,
      });
      return;
    }

    // Nếu có lỗi thì trả về lỗi cho client.
    // Ví dụ như upload một file không phải file ảnh theo như cấu hình của mình bên trên
    if (error) {
      return res.send(`Error when trying to upload: ${error}`);
    }
    // Không có lỗi thì lưu lại cái url ảnh gửi về cho client.
    // Đồng thời file đã được lưu vào thư mục uploads

    const newCourse = new CourseModel({
      ...req.body,
      lesson: [],
      image: `http://127.0.0.1:8080/images/${req.files.image[0].filename}`,
      outline: `http://127.0.0.1:8080/outlines/${req.files.outline[0].filename}`,
    });

    const newTopic = new TopicModel({
      _id: newCourse._id,
      thread: [],
    });

    try {
      await newCourse.save(); // ghi thêm course mới vào db
      await newTopic.save(); // ghi thêm topic mới vào db
      res.status(201).json({ newCourse: newCourse });
    } catch (error) {
      error.status = 400;
      next(error);
    }

    // console.log(req.files.image) //do multer gắn đối tượng file vào req nên ta mới đọc được nếu như log ở ngoài uploadFile thì sẽ không có đối tượng này
  });
};

export const updateCourse = async (req, res, next) => {
  const id = req.params.id;

  let errors = [];

  uploadFile(req, res, async (error) => {
    // const course = await CourseModel.findOne({ name: req.body.name }); // tìm ra course có name truyền vào

    const course = await CourseModel.findOne({ name: req.body.name }); // tìm ra course có name truyền vào

    !!req.body &&
      !!req.body.name &&
      course &&
      errors.push("Course name is Duplicate");

    if (!!errors.length) {
      res.status(500).json({
        errors: errors,
      });
      return;
    }

    // Nếu có lỗi thì trả về lỗi cho client.
    // Ví dụ như upload một file không phải file ảnh theo như cấu hình của mình bên trên
    if (error) {
      return res.send(`Error when trying to upload: ${error}`);
    }
    // Không có lỗi thì lưu lại cái url ảnh gửi về cho client.
    // Đồng thời file đã được lưu vào thư mục uploads

    const newCourse = {
      ...req.body,
      image: `http://127.0.0.1:8080/images/${
        !!req.files && !!req.files.image && req.files.image[0].filename
      }`,
      outline: `http://127.0.0.1:8080/outlines/${
        !!req.files && !!req.files.outline && req.files.outline[0].filename
      }`,
    };

    if (!req.files) {
      delete newCourse.image;
      delete newCourse.outline;
    } else {
      !req.files.image && delete newCourse.image;
      !req.files.outline && delete newCourse.outline;
    }

    CourseModel.findOneAndUpdate({ _id: id }, { ...newCourse }, (err, doc) => {
      if (err) {
        err.status = 500;
        return next(err);
      }
      return res.status(200).json({ success: true });
    });

    // console.log(req.files.image) //do multer gắn đối tượng file vào req nên ta mới đọc được nếu như log ở ngoài uploadFile thì sẽ không có đối tượng này
  });
};

export const detailCourse = async (req, res, next) => {
  try {
    const course = await CourseModel.findOne({ _id: req.params.id });

    res.status(200).json({ course });
  } catch (error) {
    next({ status: 404 });
    return;
  }
};

export const createLesson = async (req, res, next) => {
  const id = req.params.id;

  const course = await CourseModel.findOne(
    { _id: req.params.id },
    (err, doc) => {
      if (err) {
        next({ status: 404 });
        return;
      }
    }
  );

  let errors = [];

  uploadFile(req, res, (error) => {
    !req.body.name && errors.push("Name is Required");
    !req.body.exercise && errors.push("Exercise is Required");
    !req.body.question && errors.push("Question is Required");
    !req.files.video && errors.push("Video is Required");

    !!req.body &&
      !!req.body.name &&
      !!find(course.lesson, { name: req.body.name }) &&
      errors.push("Lesson name is Duplicate");

    if (!!errors.length) {
      res.status(500).json({
        errors: errors,
      });
      return;
    }

    // Nếu có lỗi thì trả về lỗi cho client.
    // Ví dụ như upload một file không phải file ảnh theo như cấu hình của mình bên trên
    if (error) {
      return res.send(`Error when trying to upload: ${error}`);
    }
    // Không có lỗi thì lưu lại cái url ảnh gửi về cho client.
    // Đồng thời file đã được lưu vào thư mục uploads

    const newLesson = {
      id: String(course.lesson.length + 1),
      ...req.body,
      video: `http://127.0.0.1:8080/videos/${
        !!req.files && !!req.files.video && req.files.video[0].filename
      }`,
    };

    CourseModel.findOneAndUpdate(
      { _id: id },
      { lesson: [...course.lesson, newLesson] },
      (err, doc) => {
        if (err) {
          err.status = 500;
          return next(err);
        }
        return res.status(200).json({ success: true });
      }
    );

    // console.log(req.files.image) //do multer gắn đối tượng file vào req nên ta mới đọc được nếu như log ở ngoài uploadFile thì sẽ không có đối tượng này
  });
};

export const updateLesson = async (req, res, next) => {
  const id = req.params.id;

  const course = await CourseModel.findOne(
    { _id: req.params.id },
    (err, doc) => {
      if (err) {
        next({ status: 404 });
        return;
      }
    }
  );

  uploadFile(req, res, (error) => {
    // Nếu có lỗi thì trả về lỗi cho client.
    // Ví dụ như upload một file không phải file ảnh theo như cấu hình của mình bên trên
    if (error) {
      return res.send(`Error when trying to upload: ${error}`);
    }
    // Không có lỗi thì lưu lại cái url ảnh gửi về cho client.
    // Đồng thời file đã được lưu vào thư mục uploads

    const cloneCourseLesson = [...course.lesson];
    const indexCourse = findIndex(course.lesson, { id: req.body.id });

    cloneCourseLesson.splice(indexCourse, 1, {
      ...cloneCourseLesson[indexCourse],
      ...req.body,
    });

    !!req.files.video &&
      (cloneCourseLesson[indexCourse].video = `http://127.0.0.1:8080/videos/${
        !!req.files && !!req.files.video && req.files.video[0].filename
      }`);

    CourseModel.findOneAndUpdate(
      { _id: id },
      { lesson: [...cloneCourseLesson] },
      (err, doc) => {
        if (err) {
          err.status = 500;
          return next(err);
        }
        return res.status(200).json({ success: true });
      }
    );

    // console.log(req.files.image) //do multer gắn đối tượng file vào req nên ta mới đọc được nếu như log ở ngoài uploadFile thì sẽ không có đối tượng này
  });
};
