const path = require('path');
const fs = require('fs').promises;
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Upload image file
// @route   POST /api/upload/image
// @access  Private
exports.uploadImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const file = req.file;
  
  // Check file type
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }

  // Check file size (5MB limit)
  if (file.size > process.env.MAX_FILE_UPLOAD || 5000000) {
    return next(new ErrorResponse('Please upload an image less than 5MB', 400));
  }

  res.status(200).json({
    success: true,
    data: {
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/${file.filename}`
    }
  });
});

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  Private
exports.uploadImages = asyncHandler(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new ErrorResponse('Please upload files', 400));
  }

  const files = req.files;
  const uploadedFiles = [];

  for (const file of files) {
    // Check file type
    if (!file.mimetype.startsWith('image')) {
      continue; // Skip non-image files
    }

    // Check file size
    if (file.size > (process.env.MAX_FILE_UPLOAD || 5000000)) {
      continue; // Skip files that are too large
    }

    uploadedFiles.push({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/${file.filename}`
    });
  }

  if (uploadedFiles.length === 0) {
    return next(new ErrorResponse('No valid image files were uploaded', 400));
  }

  res.status(200).json({
    success: true,
    count: uploadedFiles.length,
    data: uploadedFiles
  });
});

// @desc    Delete uploaded file
// @route   DELETE /api/upload/:filename
// @access  Private
exports.deleteFile = asyncHandler(async (req, res, next) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../uploads', filename);

  try {
    await fs.access(filePath);
    await fs.unlink(filePath);
    
    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    return next(new ErrorResponse('File not found', 404));
  }
});

// @desc    Get file info
// @route   GET /api/upload/:filename
// @access  Public
exports.getFileInfo = asyncHandler(async (req, res, next) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../uploads', filename);

  try {
    const stats = await fs.stat(filePath);
    
    res.status(200).json({
      success: true,
      data: {
        filename,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        url: `/uploads/${filename}`
      }
    });
  } catch (error) {
    return next(new ErrorResponse('File not found', 404));
  }
});

// @desc    Upload video file
// @route   POST /api/v1/upload/video
// @access  Private (Admin/Teacher)
exports.uploadVideo = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a video file', 400));
  }

  // Check if file is a video
  if (!req.file.mimetype.startsWith('video')) {
    return next(new ErrorResponse('Please upload a video file', 400));
  }

  const uploadDir = path.join(__dirname, '../uploads/videos');
  await fs.mkdir(uploadDir, { recursive: true });

  const filename = `video_${Date.now()}_${Math.round(Math.random() * 1E9)}.${req.file.mimetype.split('/')[1]}`;
  const filePath = path.join(uploadDir, filename);

  await fs.writeFile(filePath, req.file.buffer);

  res.status(201).json({
    success: true,
    data: {
      filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: `/uploads/videos/${filename}`
    }
  });
});

// @desc    Upload document file
// @route   POST /api/v1/upload/document
// @access  Private (Admin/Teacher)
exports.uploadDocument = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a document file', 400));
  }

  // Check if file is a document
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    return next(new ErrorResponse('Please upload a valid document file (PDF, DOC, DOCX, TXT)', 400));
  }

  const uploadDir = path.join(__dirname, '../uploads/documents');
  await fs.mkdir(uploadDir, { recursive: true });

  const extension = req.file.originalname.split('.').pop();
  const filename = `doc_${Date.now()}_${Math.round(Math.random() * 1E9)}.${extension}`;
  const filePath = path.join(uploadDir, filename);

  await fs.writeFile(filePath, req.file.buffer);

  res.status(201).json({
    success: true,
    data: {
      filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: `/uploads/documents/${filename}`
    }
  });
});

// @desc    Get all uploaded files
// @route   GET /api/v1/upload/files
// @access  Private (Admin/Teacher)
exports.getUploadedFiles = asyncHandler(async (req, res, next) => {
  const { type = 'all', page = 1, limit = 20 } = req.query;
  
  const uploadDir = path.join(__dirname, '../uploads');
  const files = [];

  try {
    // Get files from different directories
    const dirs = type === 'all' ? ['images', 'videos', 'documents'] : [type];
    
    for (const dir of dirs) {
      const dirPath = path.join(uploadDir, dir);
      try {
        const dirFiles = await fs.readdir(dirPath);
        for (const file of dirFiles) {
          const filePath = path.join(dirPath, file);
          const stats = await fs.stat(filePath);
          
          files.push({
            filename: file,
            type: dir,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            url: `/uploads/${dir}/${file}`
          });
        }
      } catch (error) {
        // Directory doesn't exist, skip
        continue;
      }
    }

    // Sort by creation date (newest first)
    files.sort((a, b) => new Date(b.created) - new Date(a.created));

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedFiles = files.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      count: paginatedFiles.length,
      total: files.length,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(files.length / parseInt(limit))
      },
      data: paginatedFiles
    });
  } catch (error) {
    return next(new ErrorResponse('Error retrieving files', 500));
  }
});