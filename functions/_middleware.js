// Cloudflare Pages中间件 - 处理所有请求
export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  const path = url.pathname;
  
  // 如果请求根路径，返回主页
  if (path === '/' || path === '') {
    return await context.next();
  }
  
  // 处理预检请求
  if (request.method === 'OPTIONS') {
    return handleCORS();
  }
  
  // 构建转发到GitHub的URL
  let githubURL;
  let isHTML = false;
  let isAPI = false;
  let isRaw = false;
  let isAsset = false;
  
  // 处理API请求
  if (path.startsWith('/api/')) {
    githubURL = `https://api.github.com${path.replace('/api', '')}${url.search}`;
    isAPI = true;
  } 
  // 处理raw内容请求
  else if (path.startsWith('/raw/')) {
    githubURL = `https://raw.githubusercontent.com${path.replace('/raw', '')}${url.search}`;
    isRaw = true;
  }
  // 处理静态资源请求 (图片, CSS, JS等)
  else if (/\.(jpg|jpeg|png|gif|svg|css|js|ico|woff|woff2|ttf|eot)$/i.test(path)) {
    githubURL = `https://github.com${path}${url.search}`;
    isAsset = true;
  }
  // 处理普通GitHub页面请求
  else {
    githubURL = `https://github.com${path}${url.search}`;
    isHTML = true;
  }
  
  // 复制原始请求的头部信息
  let headers = new Headers(request.headers);
  headers.delete('host');
  
  // 添加必要的头部信息以访问GitHub API
  if (isAPI) {
    headers.set('Accept', 'application/vnd.github.v3+json');
    
    // 如果环境变量中设置了GitHub令牌，使用它
    const githubToken = context.env.GITHUB_TOKEN;
    if (githubToken) {
      headers.set('Authorization', `token ${githubToken}`);
    }
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
    
    // 对于HTML内容，需要重写URL
    if (isHTML && response.headers.get('content-type')?.includes('text/html')) {
      const text = await response.text();
      const modifiedText = rewriteGitHubLinks(text, url.origin);
      
      // 创建新的响应头
      let newHeaders = new Headers(response.headers);
      newHeaders.set('Access-Control-Allow-Origin', '*');
      
      return new Response(modifiedText, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    }
    
    // 创建新的响应头
    let newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  } catch (err) {
    return new Response(`请求GitHub失败: ${err.message}`, { 
      status: 500,
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' }
    });
  }
}

/**
 * 处理CORS预检请求
 */
function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}

/**
 * 重写HTML中的GitHub链接为代理链接
 * @param {string} html HTML内容
 * @param {string} proxyOrigin 代理的源地址
 * @returns {string} 重写后的HTML
 */
function rewriteGitHubLinks(html, proxyOrigin) {
  // 替换绝对链接
  html = html.replace(/https:\/\/github\.com\//g, `${proxyOrigin}/`);
  html = html.replace(/https:\/\/api\.github\.com\//g, `${proxyOrigin}/api/`);
  html = html.replace(/https:\/\/raw\.githubusercontent\.com\//g, `${proxyOrigin}/raw/`);
  
  // 替换相对链接
  html = html.replace(/href="\/([^"]*)"/g, `href="${proxyOrigin}/$1"`);
  html = html.replace(/src="\/([^"]*)"/g, `src="${proxyOrigin}/$1"`);
  
  return html;
}