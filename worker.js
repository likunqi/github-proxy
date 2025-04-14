// GitHub代理 Worker
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const search = url.search;
  
  // 构建转发到GitHub的URL
  let githubURL;
  
  // 处理API请求
  if (path.startsWith('/api/')) {
    githubURL = `https://api.github.com${path.replace('/api', '')}${search}`;
  } 
  // 处理raw内容请求
  else if (path.startsWith('/raw/')) {
    githubURL = `https://raw.githubusercontent.com${path.replace('/raw', '')}${search}`;
  }
  // 处理普通GitHub页面请求
  else {
    githubURL = `https://github.com${path}${search}`;
  }
  
  // 复制原始请求的头部信息
  let headers = new Headers(request.headers);
  
  // 添加必要的头部信息以访问GitHub API
  if (path.startsWith('/api/')) {
    headers.set('Accept', 'application/vnd.github.v3+json');
    
    // 如果有GitHub令牌设置(可选)
    // headers.set('Authorization', 'token YOUR_GITHUB_TOKEN');
  }
  
  // 创建新的请求
  let githubRequest = new Request(githubURL, {
    method: request.method,
    headers: headers,
    body: request.body,
    redirect: 'follow'
  });
  
  try {
    // 获取GitHub的响应
    let response = await fetch(githubRequest);
    
    // 创建新的响应头
    let newHeaders = new Headers(response.headers);
    
    // 设置CORS头，允许跨域访问
    newHeaders.set('Access-Control-Allow-Origin', '*');
    
    // 返回修改过的响应
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  } catch (err) {
    return new Response(`请求GitHub失败: ${err.message}`, { status: 500 });
  }
}