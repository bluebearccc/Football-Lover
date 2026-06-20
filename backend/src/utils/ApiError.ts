export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message = 'Yêu cầu không hợp lệ', details?: unknown): ApiError {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn'): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Bạn không có quyền thực hiện thao tác này'): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message = 'Không tìm thấy dữ liệu'): ApiError {
    return new ApiError(404, message);
  }

  static conflict(message = 'Dữ liệu đã tồn tại'): ApiError {
    return new ApiError(409, message);
  }

  static tooManyRequests(message = 'Bạn thao tác quá nhanh, vui lòng thử lại sau'): ApiError {
    return new ApiError(429, message);
  }
}
