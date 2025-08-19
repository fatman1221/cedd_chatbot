export const DRAWER_WIDTH = 280;
export const COLLAPSED_WIDTH = 72;

export const MODULE_DATA = {
  general: {
    icon: 'LayoutIcon',
    color: 'primary.main',
    bgColor: 'primary.50'
  },
  tender: {
    icon: 'FileTextIcon',
    color: 'success.main',
    bgColor: 'success.50'
  },
  consultancy: {
    icon: 'BookOpenIcon',
    color: 'secondary.main',
    bgColor: 'secondary.50'
  },
  contract: {
    icon: 'FileQuestionIcon',
    color: 'warning.main',
    bgColor: 'warning.50'
  }
} as const;

export const SUPPORTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/markdown'
]; 