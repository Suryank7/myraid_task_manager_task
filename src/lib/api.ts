let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb)
}

const onRefreshed = (token: string) => {
  refreshSubscribers.map(cb => cb(token))
  refreshSubscribers = []
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let response = await fetch(input, init)
  
  if (response.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true
      try {
        const refreshRes = await fetch('/api/auth/refresh', { method: 'POST' })
        if (refreshRes.ok) {
          isRefreshing = false
          onRefreshed('success')
          // Retry original request
          response = await fetch(input, init)
        } else {
          isRefreshing = false
          // Redirect to login or dispatch event
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
        }
      } catch (err) {
        isRefreshing = false
      }
    } else {
      // wait for refresh
      return new Promise(resolve => {
        subscribeTokenRefresh(async () => {
          resolve(await fetch(input, init))
        })
      })
    }
  }
  
  return response
}
