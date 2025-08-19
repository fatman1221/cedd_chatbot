export interface User {
  id: string;
  email: string;
  role: 'root' | 'regular';
  status: 'pending' | 'approved' | 'rejected';
  isVerified?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirm_password: string;
  role: 'root' | 'regular';
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface MessageResponse {
  message: string;
}

export interface PendingUser {
  id: string;
  email: string;
  role: 'root' | 'regular';
  createdAt: string;
  approvalToken: string;
}

const API_BASE_URL = 'http://61.135.204.117:25104/cedd';  // 完整代理路径

// 生成审批token
const generateApprovalToken = (userEmail: string, userRole: string): string => {
  const data = {
    email: userEmail,
    role: userRole,
    timestamp: Date.now()
  };
  return btoa(JSON.stringify(data));
};

// 发送管理员审批邮件
const sendAdminApprovalEmail = async (userEmail: string, userRole: string) => {
  try {
    const adminConfig = JSON.parse(localStorage.getItem('adminConfig') || '{}');

    if (!adminConfig.enableNotifications || !adminConfig.adminEmail) {
      console.log('管理员邮件通知未配置或已禁用');
      return;
    }

    const approvalToken = generateApprovalToken(userEmail, userRole);
    const approveUrl = `${window.location.origin}/admin/approve?token=${approvalToken}&action=approve`;
    const rejectUrl = `${window.location.origin}/admin/approve?token=${approvalToken}&action=reject`;

    // 保存待审批用户信息
    const pendingUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
    const pendingUser: PendingUser = {
      id: Date.now().toString(),
      email: userEmail,
      role: userRole,
      createdAt: new Date().toISOString(),
      approvalToken
    };
    pendingUsers.push(pendingUser);
    localStorage.setItem('pendingUsers', JSON.stringify(pendingUsers));

    console.log(`=== 管理员审批邮件 ===`);
    console.log(`收件人: ${adminConfig.adminEmail}`);
    console.log(`主题: 新用户注册申请 - ${userEmail}`);
    console.log(`内容:`);
    console.log(`新用户申请注册:`);
    console.log(`邮箱: ${userEmail}`);
    console.log(`申请角色: ${userRole === 'root' ? '管理员' : '普通用户'}`);
    console.log(`申请时间: ${new Date().toLocaleString()}`);
    console.log(`\n请点击以下链接进行审批:`);
    console.log(`批准: ${approveUrl}`);
    console.log(`拒绝: ${rejectUrl}`);
    console.log(`==================`);

  } catch (error) {
    console.error('发送管理员审批邮件失败:', error);
  }
};

// 发送用户审批结果邮件
const sendUserApprovalResultEmail = async (userEmail: string, approved: boolean, role: string) => {
  try {
    const adminConfig = JSON.parse(localStorage.getItem('adminConfig') || '{}');

    console.log(`=== 用户审批结果邮件 ===`);
    console.log(`收件人: ${userEmail}`);
    console.log(`主题: ${approved ? '注册申请已通过' : '注册申请被拒绝'}`);
    console.log(`内容:`);
    if (approved) {
      console.log(`恭喜！您的注册申请已通过审批。`);
      console.log(`角色: ${role === 'root' ? '管理员' : '普通用户'}`);
      console.log(`您现在可以登录系统了。`);
      console.log(`登录地址: ${window.location.origin}/login`);
    } else {
      console.log(`很抱歉，您的注册申请被拒绝。`);
      console.log(`如有疑问，请联系管理员。`);
    }
    console.log(`==================`);


  } catch (error) {
    console.error('发送用户审批结果邮件失败:', error);
  }
};

class AuthService {
  private baseUrl = API_BASE_URL

  // 登录
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      // console.log(data)
      // console.log(JSON.stringify(data))
      const response = await fetch(`${this.baseUrl}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      console.log(response)
      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData)
        throw new Error(errorData.detail || '登录失败');
      }

      const responseData = await response.json();
      const result = responseData["data"];
      console.log(result)
      // 保存token和用户信息
      this.saveToken(result.token);
      this.saveUser(result.user);

      return {
        user: result.user,
        token: result.token,
        message: '登录成功'
      };
    } catch (error) {
      console.error('登录错误:', error);
      throw error instanceof Error ? error : new Error('登录失败');
    }
  }

  // 注册
  async register(data: RegisterRequest): Promise<MessageResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      console.log(response)
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '注册失败');
      }

      console.log(response)
      const result = await response.json();

      // 发送管理员审批邮件通知（前端日志）
      await sendAdminApprovalEmail(data.email, data.role);

      return {
        "message": result.message || '注册申请已提交，请等待管理员审批。审批结果将通过邮件通知您。'
      };
    } catch (error) {
      console.error('注册错误:', error);
      throw error instanceof Error ? error : new Error('注册失败');
    }
  }

  // 管理员审批用户
  async approveUser(token: string, action: 'approve' | 'reject'): Promise<MessageResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/approve-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${this.getToken()}`,
        },
        body: JSON.stringify({ token, action }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '审批操作失败');
      }

      const responseData = await response.json();
      const result = responseData["data"];
      return { "message": result.message };
    } catch (error) {
      console.error('审批错误:', error);
      throw error instanceof Error ? error : new Error('审批操作失败');
    }
  }

  // 获取待审批用户列表（管理员功能）
  async getPendingUsers(): Promise<PendingUser[]> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/get-pending-users`, {
        method: 'GET',
        headers: {
          'Authorization': `${this.getToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '获取待审批用户失败');
      }

      const result = await response.json();
      return result
    } catch (error) {
      console.error('获取待审批用户错误:', error);
      return [];
    }
  }

  // 获取已审批用户列表（管理员功能）
  async getApprovedUsers(): Promise<User[]> {
    console.log(this.getToken)
    try {
      const response = await fetch(`${this.baseUrl}/admin/get-approved-users`, {
        method: 'GET',
        headers: {
          'Authorization': `${this.getToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '获取已审批用户失败');
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('获取已审批用户错误:', error);
      return [];
    }
  }

  // 验证邮箱（保留原有接口，但现在不需要）
  async verifyEmail(token: string): Promise<MessageResponse> {
    return { message: '该功能已被管理员审批制替代' };
  }

  // 忘记密码
  async forgotPassword(email: string): Promise<MessageResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/user/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "email": email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '发送重置邮件失败');
      }

      const responseData = await response.json();
      const result = responseData["data"];
      return { "message": result.message || '密码重置邮件已发送' };
    } catch (error) {
      console.error('忘记密码错误:', error);
      throw error instanceof Error ? error : new Error('发送重置邮件失败');
    }
  }

  // 重置密码
  async resetPassword(token: string, password: string, confirmPassword: string): Promise<MessageResponse> {
    if (password !== confirmPassword) {
      throw new Error('两次输入的密码不一致');
    }

    try {
      const response = await fetch(`${this.baseUrl}/user/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, new_password: password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '密码重置失败');
      }

      const result = await response.json();
      return { message: result.message || '密码重置成功' };
    } catch (error) {
      console.error('重置密码错误:', error);
      throw error instanceof Error ? error : new Error('密码重置失败');
    }
  }

  // 获取当前用户信息
  async getCurrentUser(): Promise<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error('未登录');
    }

    try {
      const response = await fetch(`${this.baseUrl}/user/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '获取用户信息失败');
      }

      const responseData = await response.json();
      const user = responseData;
      this.saveUser(user);
      return user;
    } catch (error) {
      console.error('获取用户信息错误:', error);
      throw error instanceof Error ? error : new Error('获取用户信息失败');
    }
  }

  // 登出
  async logout(): Promise<void> {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
  }

  // 保存token
  saveToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  // 获取token
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // 保存用户信息
  saveUser(user: User): void {
    localStorage.setItem('user_info', JSON.stringify(user));
  }

  // 获取用户信息
  getUser(): User | null {
    const userStr = localStorage.getItem('user_info');
    return userStr ? JSON.parse(userStr) : null;
  }

  // 检查是否已登录
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // 检查用户权限
  hasRole(role: 'root' | 'regular'): boolean {
    const user = this.getUser();
    return user?.role === role;
  }

  // 检查是否为管理员
  isAdmin(): boolean {
    return this.hasRole('root');
  }

  async removeModuleDocument(filename: string, module: string): Promise<void> {
    const formData = new FormData();
    formData.append(`filename`, filename)
    formData.append(`collection_name`, module)
    const response = await fetch(`${API_BASE_URL}/rag/remove_module_document`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `${this.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.details;
  }

  async chunkDocument(file_id: string, module: string): Promise<void> {
    const formData = new FormData();
    formData.append(`file_id`, file_id)
    formData.append(`module_name`, module)
    const response = await fetch(`${API_BASE_URL}/rag/process_one_document`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `${this.getToken()}`,
      },
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.details;
  }
}

export const authService = new AuthService();