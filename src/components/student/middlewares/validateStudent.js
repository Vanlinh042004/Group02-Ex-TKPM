function validateStudent(req, res, next) {
  const { email, phone, faculty, status } = req.body;

  // Kiểm tra định dạng email
  if (email !== undefined) {
    const emailRegex =
      /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;

    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format ' });
    }
  }

  // Kiểm tra định dạng số điện thoại
  if (phone !== undefined) {
    const phoneRegex = /^[0-9]{10,}$/;
    if (!phone || !phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }
  }

  // Kiểm tra tên khoa
  if (faculty !== undefined) {
    const validFaculties = [
      'Khoa Luật',
      'Khoa Tiếng Anh thương mại',
      'Khoa Tiếng Nhật',
      'Khoa Tiếng Pháp',
    ];
    if (!faculty || !validFaculties.includes(faculty)) {
      return res.status(400).json({ message: 'Invalid faculty' });
    }
  }

  // Kiểm tra status
  if (status !== undefined) {
    const validStatuses = [
      'Đang học',
      'Đã tốt nghiệp',
      'Đã thôi học',
      'Tạm dừng học',
    ];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
  }

  next();
}

module.exports = validateStudent;
