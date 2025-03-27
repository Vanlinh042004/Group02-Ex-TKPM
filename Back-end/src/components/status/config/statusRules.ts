export const validStatuses = [
  'Đang học',
  'Đã tốt nghiệp',
  'Đã thôi học',
  'Bảo lưu',
  'Đình chỉ',
];

export const statusTransitionRules: Record<string, string[]> = {
  'Đang học': ['Bảo lưu', 'Đã tốt nghiệp', 'Đình chỉ', 'Đã thôi học'],
  'Bảo lưu': ['Đang học', 'Đình chỉ', 'Đã thôi học'],
  'Đã tốt nghiệp': [],
  'Đã thôi học': [],
  'Đình chỉ': ['Đã thôi học', 'Đang học'],
};
