import axios from 'axios';

const instance = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 세션 쿠키를 함께 보내기 위해 추가
});

// 요청 인터셉터
instance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 에러(인증 실패) 처리
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized error, handle login redirection here');
    }
    return Promise.reject(error);
  }
);

export default instance;
