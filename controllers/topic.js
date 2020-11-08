import find from "lodash/find";
import findIndex from "lodash/findIndex";
import moment from "moment";
import multer from "multer";
import shortid from "shortid";

import TopicModel from "../models/topic.model";
import UserModel from "../models/user.model.js";

export const showAllThreadsOnTopic = async (req, res, next) => {
  const id = req.params.id;

  const listTopic = await TopicModel.findOne({ _id: id }, (err, doc) => {
    if (err) {
      next({ status: 404 });
      return;
    }
  });

  res.status(200).json({
    listTopic: listTopic,
  });
};

export const detailThread = async (req, res, next) => {
  const id = req.params.id;

  const listTopic = await TopicModel.findOne({ _id: id }, (err, doc) => {
    if (err) {
      next({ status: 404 });
      return;
    }
  });

  const detailThread = find(listTopic.thread, { id: req.query.id });

  if (!detailThread) {
    next({ status: 404 });
    return;
  }

  res.status(200).json({
    detailThread: detailThread,
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

export const createThread = async (req, res, next) => {
  uploadFile(req, res, async (error) => {
    const id = req.params.id;

    let errors = [];

    !req.body.id_author && errors.push("Id_Author is Required"); // multer sẽ gắn các trường bt (string,number,object) vào req.body, còn dạng file (image,txt,video) thì gắn vào req.file
    !req.body.content && errors.push("Content is Required");

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

    const authorUser = await UserModel.findOne({ _id: req.body.id_author });

    if (!authorUser) {
      next({ status: 404 });
      return;
    }

    const newThread = {
      idThread: id,
      id: shortid.generate(),
      author: {
        id: authorUser.id,
        name: authorUser.name,
        role: authorUser.role,
      },
      content: req.body.content,
      image: `http://127.0.0.1:8080/images/${
        !!req.files && !!req.files.image && req.files.image[0].filename
      }`,
      video: `http://127.0.0.1:8080/videos/${
        !!req.files && !!req.files.video && req.files.video[0].filename
      }`,
      outline: `http://127.0.0.1:8080/outlines/${
        !!req.files && !!req.files.outline && req.files.outline[0].filename
      }`,
      comment: [],
      date_create: moment().format(),
    };

    !req.files.image && delete newThread.image;
    !req.files.video && delete newThread.video;
    !req.files.outline && delete newThread.outline;

    const thisTopic = await TopicModel.findOne({ _id: id }, (err, doc) => {
      if (err) {
        next({ status: 404 });
        return;
      }
    });

    const thisThread = thisTopic.thread;

    TopicModel.findOneAndUpdate(
      { _id: id },
      { thread: [...thisThread, newThread] },
      (err, doc) => {
        if (err) {
          err.status = 500;
          return next(err);
        }
        return res.status(201).json({ success: true });
      }
    );

    // console.log(req.files.image) //do multer gắn đối tượng file vào req nên ta mới đọc được nếu như log ở ngoài uploadFile thì sẽ không có đối tượng này
  });
};
// continue //
export const updateThread = async (req, res, next) => {
  const id = req.params.id;

  uploadFile(req, res, async (error) => {
    let errors = [];

    !req.body.id_thread && errors.push("Id_Thread is Required");

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

    const newThread = {
      content: req.body.content,
      image: `http://127.0.0.1:8080/images/${
        !!req.files && !!req.files.image && req.files.image[0].filename
      }`,
      video: `http://127.0.0.1:8080/videos/${
        !!req.files && !!req.files.video && req.files.video[0].filename
      }`,
      outline: `http://127.0.0.1:8080/outlines/${
        !!req.files && !!req.files.outline && req.files.outline[0].filename
      }`,
    };

    !req.body.content && delete newThread.content;
    !req.files.image && delete newThread.image;
    !req.files.video && delete newThread.video;
    !req.files.outline && delete newThread.outline;

    const thisTopic = await TopicModel.findOne({ _id: id }, (err, doc) => {
      if (err) {
        next({ status: 404 });
        return;
      }
    });

    const cloneThread = [...thisTopic.thread];

    const indexThreadNeedUpdate = findIndex(cloneThread, {
      id: req.body.id_thread,
    });

    if (indexThreadNeedUpdate < 0) {
      next({ status: 404 });
      return;
    }

    const threadAfterUpdate = {
      ...cloneThread[indexThreadNeedUpdate],
      ...newThread,
    };

    cloneThread.splice(indexThreadNeedUpdate, 1, threadAfterUpdate);

    TopicModel.findOneAndUpdate(
      { _id: id },
      { thread: [...cloneThread] },
      (err, doc) => {
        if (err) {
          err.status = 500;
          return next(err);
        }
        return res.status(201).json({
          update_thread: threadAfterUpdate,
        });
      }
    );

    // console.log(req.files.image) //do multer gắn đối tượng file vào req nên ta mới đọc được nếu như log ở ngoài uploadFile thì sẽ không có đối tượng này
  });
};

export const addComment = async (req, res, next) => {
  uploadFile(req, res, async (error) => {
    const id = req.params.id;

    let errors = [];

    !req.body.id_author_comment && errors.push("Id_author_comment is Required"); // multer sẽ gắn các trường bt (string,number,object) vào req.body, còn dạng file (image,txt,video) thì gắn vào req.file
    !req.body.id_thread && errors.push("Id_thread is Required");
    !req.body.content && errors.push("Content is Required");

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

    const authorComment = await UserModel.findOne(
      { _id: req.body.id_author_comment },
      (err, doc) => {
        if (err) {
          next({ status: 404 });
          return;
        }
      }
    );

    const newComment = {
      id: shortid.generate(),
      author_comment: {
        id: authorComment.id,
        name: authorComment.name,
        role: authorComment.role,
      },
      content: req.body.content,
      image: `http://127.0.0.1:8080/images/${
        !!req.files && !!req.files.image && req.files.image[0].filename
      }`,
      video: `http://127.0.0.1:8080/videos/${
        !!req.files && !!req.files.video && req.files.video[0].filename
      }`,
      outline: `http://127.0.0.1:8080/outlines/${
        !!req.files && !!req.files.outline && req.files.outline[0].filename
      }`,
      date_create: moment().format(),
    };

    !req.files.image && delete newComment.image;
    !req.files.video && delete newComment.video;
    !req.files.outline && delete newComment.outline;

    const thisTopic = await TopicModel.findOne({ _id: id }, (err, doc) => {
      if (err) {
        next({ status: 404 });
        return;
      }
    });

    const cloneThread = [...thisTopic.thread];

    const indexThreadNeedUpdate = findIndex(cloneThread, {
      id: req.body.id_thread,
    });

    if (indexThreadNeedUpdate < 0) {
      next({ status: 404 });
      return;
    }

    const threadAfterAddComment = {
      ...cloneThread[indexThreadNeedUpdate],
      comment: [...cloneThread[indexThreadNeedUpdate].comment, newComment],
    };

    cloneThread.splice(indexThreadNeedUpdate, 1, threadAfterAddComment);

    TopicModel.findOneAndUpdate(
      { _id: id },
      { thread: [...cloneThread] },
      (err, doc) => {
        if (err) {
          err.status = 500;
          return next(err);
        }
        return res.status(201).json({
          thread: threadAfterAddComment,
        });
      }
    );

    // console.log(req.files.image) //do multer gắn đối tượng file vào req nên ta mới đọc được nếu như log ở ngoài uploadFile thì sẽ không có đối tượng này
  });
};

export const updateComment = async (req, res, next) => {
  uploadFile(req, res, async (error) => {
    const id = req.params.id;

    let errors = [];

    !req.body.id_thread && errors.push("Id_thread is Required"); // multer sẽ gắn các trường bt (string,number,object) vào req.body, còn dạng file (image,txt,video) thì gắn vào req.file
    !req.body.id_comment && errors.push("Id_comment is Required");

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

    const newComment = {
      content: req.body.content,
      image: `http://127.0.0.1:8080/images/${
        !!req.files && !!req.files.image && req.files.image[0].filename
      }`,
      video: `http://127.0.0.1:8080/videos/${
        !!req.files && !!req.files.video && req.files.video[0].filename
      }`,
      outline: `http://127.0.0.1:8080/outlines/${
        !!req.files && !!req.files.outline && req.files.outline[0].filename
      }`,
    };

    !req.files.image && delete newComment.image;
    !req.files.video && delete newComment.video;
    !req.files.outline && delete newComment.outline;

    const thisTopic = await TopicModel.findOne({ _id: id }, (err, doc) => {
      if (err) {
        next({ status: 404 });
        return;
      }
    });

    const cloneThread = [...thisTopic.thread];

    const indexThreadNeedUpdate = findIndex(cloneThread, {
      id: req.body.id_thread,
    });

    if (indexThreadNeedUpdate < 0) {
      next({ status: 404 });
      return;
    }

    // update comment
    const cloneListComment = cloneThread[indexThreadNeedUpdate].comment;

    const indexCommentNeedUpdate = findIndex(cloneListComment, {
      id: req.body.id_comment,
    });

    if (indexCommentNeedUpdate < 0) {
      next({ status: 404 });
      return;
    }

    cloneListComment.splice(indexCommentNeedUpdate, 1, {
      ...cloneListComment[indexCommentNeedUpdate],
      ...newComment,
    });
    // update comment

    const threadAfterAddComment = {
      ...cloneThread[indexThreadNeedUpdate],
      comment: [...cloneListComment],
    };

    cloneThread.splice(indexThreadNeedUpdate, 1, threadAfterAddComment);

    TopicModel.findOneAndUpdate(
      { _id: id },
      { thread: [...cloneThread] },
      (err, doc) => {
        if (err) {
          err.status = 500;
          return next(err);
        }
        return res.status(200).json({
          thread: threadAfterAddComment,
        });
      }
    );

    // console.log(req.files.image) //do multer gắn đối tượng file vào req nên ta mới đọc được nếu như log ở ngoài uploadFile thì sẽ không có đối tượng này
  });
};
