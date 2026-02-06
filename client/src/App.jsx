import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_BASE = 'http://localhost:5000/api'
const STORAGE_KEYS = {
  session: 'ml_session',
}

const readSession = () => {
  const raw = localStorage.getItem(STORAGE_KEYS.session)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const writeSession = (session) => {
  if (session) {
    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session))
  } else {
    localStorage.removeItem(STORAGE_KEYS.session)
  }
}

const apiRequest = async (path, { method = 'GET', body, token } = {}) => {
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (response.status === 204) return null

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const message =
      typeof data === 'string'
        ? data
        : data?.message || 'Request failed. Please try again.'
    const error = new Error(message)
    error.status = response.status
    throw error
  }

  return data
}

const normalizeMovie = (movie) => {
  if (!movie) return null
  return {
    id: movie.id || movie._id,
    title: movie.title || '',
    year: movie.year ?? movie.releaseYear ?? '',
    genre: movie.genre || '',
    poster: movie.poster || movie.imageUrl || '',
    summary: movie.summary || movie.description || '',
    ownerId: movie.ownerId || movie.userId || movie.owner?._id || '',
    createdAt: movie.createdAt || movie.created_at || new Date().toISOString(),
  }
}

const normalizeComment = (comment) => {
  if (!comment) return null
  return {
    id: comment.id || comment._id,
    movieId: comment.movieId || comment.movie || comment.movie?._id || '',
    authorId: comment.authorId || comment.userId || comment.author?._id || '',
    authorName:
      comment.authorName ||
      comment.author?.username ||
      comment.author?.name ||
      'Anonymous',
    text: comment.text || comment.content || '',
    createdAt:
      comment.createdAt || comment.created_at || new Date().toISOString(),
  }
}

const normalizeUser = (user) => {
  if (!user) return null
  return {
    id: user.id || user._id,
    username: user.username || user.name || user.email || 'User',
    email: user.email || '',
  }
}

const api = {
  register: (payload) => apiRequest('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => apiRequest('/auth/login', { method: 'POST', body: payload }),
  logout: (token) => apiRequest('/auth/logout', { method: 'POST', token }),
  getMovies: () => apiRequest('/movies'),
  getMovie: (id) => apiRequest(`/movies/${id}`),
  createMovie: (payload, token) =>
    apiRequest('/movies', { method: 'POST', body: payload, token }),
  updateMovie: (id, payload, token) =>
    apiRequest(`/movies/${id}`, { method: 'PUT', body: payload, token }),
  deleteMovie: (id, token) =>
    apiRequest(`/movies/${id}`, { method: 'DELETE', token }),
  getComments: (movieId) => apiRequest(`/movies/${movieId}/comments`),
  addComment: (movieId, payload, token) =>
    apiRequest(`/movies/${movieId}/comments`, {
      method: 'POST',
      body: payload,
      token,
    }),
}

const parseHash = () => {
  const raw = window.location.hash || '#/'
  const cleaned = raw.replace(/^#/, '')
  const path = cleaned.split('?')[0]
  const parts = path.split('/').filter(Boolean)

  if (parts.length === 0) return { page: 'home' }

  if (parts[0] === 'login') return { page: 'login' }
  if (parts[0] === 'register') return { page: 'register' }
  if (parts[0] === 'create') return { page: 'create' }

  if (parts[0] === 'movies' && parts[1]) {
    if (parts[2] === 'edit') return { page: 'edit', movieId: parts[1] }
    return { page: 'details', movieId: parts[1] }
  }

  return { page: 'notfound' }
}

const navigate = (path) => {
  window.location.hash = path
}

const formatDate = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown date'
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function App() {
  const [session, setSession] = useState(() => readSession())
  const [movies, setMovies] = useState([])
  const [activeMovie, setActiveMovie] = useState(null)
  const [activeComments, setActiveComments] = useState([])
  const [route, setRoute] = useState(() => parseHash())
  const [notice, setNotice] = useState(null)
  const [loading, setLoading] = useState(false)

  const currentUser = session?.user || null

  useEffect(() => {
    writeSession(session)
  }, [session])

  useEffect(() => {
    const handleHash = () => setRoute(parseHash())
    window.addEventListener('hashchange', handleHash)
    if (!window.location.hash) navigate('/')
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  useEffect(() => {
    if (!notice) return undefined
    const timer = setTimeout(() => setNotice(null), 3200)
    return () => clearTimeout(timer)
  }, [notice])

  const loadMovies = async () => {
    setLoading(true)
    try {
      const data = await api.getMovies()
      const items = Array.isArray(data) ? data : data?.data || []
      setMovies(items.map(normalizeMovie).filter(Boolean))
    } catch (error) {
      setNotice({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMovies()
  }, [])

  useEffect(() => {
    const loadMovieDetails = async () => {
      if (!route.movieId) return
      try {
        const data = await api.getMovie(route.movieId)
        setActiveMovie(normalizeMovie(data?.data || data))
      } catch (error) {
        setActiveMovie(null)
        setNotice({ type: 'error', text: error.message })
      }
    }

    if (route.page === 'details' || route.page === 'edit') {
      loadMovieDetails()
    } else {
      setActiveMovie(null)
    }
  }, [route.page, route.movieId])

  useEffect(() => {
    const loadMovieComments = async () => {
      if (!route.movieId) return
      try {
        const data = await api.getComments(route.movieId)
        const items = Array.isArray(data) ? data : data?.data || []
        setActiveComments(items.map(normalizeComment).filter(Boolean))
      } catch (error) {
        setActiveComments([])
        setNotice({ type: 'error', text: error.message })
      }
    }

    if (route.page === 'details') {
      loadMovieComments()
    } else {
      setActiveComments([])
    }
  }, [route.page, route.movieId])

  const sortedMovies = useMemo(() => {
    return [...movies].sort((a, b) =>
      String(b.createdAt).localeCompare(String(a.createdAt)),
    )
  }, [movies])

  const handleRegister = async (values) => {
    try {
      const data = await api.register({
        username: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      })
      const payload = data?.data || data
      setSession({ token: payload.token, user: normalizeUser(payload.user) })
      setNotice({ type: 'success', text: 'Welcome! Your account is ready.' })
      navigate('/')
    } catch (error) {
      setNotice({ type: 'error', text: error.message })
    }
  }

  const handleLogin = async (values) => {
    try {
      const data = await api.login({
        email: values.email.trim(),
        password: values.password,
      })
      const payload = data?.data || data
      const user = normalizeUser(payload.user)
      setSession({ token: payload.token, user })
      setNotice({
        type: 'success',
        text: `Welcome back, ${user?.username || 'friend'}.`,
      })
      navigate('/')
    } catch (error) {
      setNotice({ type: 'error', text: error.message })
    }
  }

  const handleLogout = async () => {
    try {
      if (session?.token) {
        await api.logout(session.token)
      }
    } catch (error) {
      setNotice({ type: 'error', text: error.message })
    } finally {
      setSession(null)
      navigate('/')
    }
  }

  const handleCreateMovie = async (values) => {
    if (!session?.token) {
      setNotice({ type: 'error', text: 'Please login to create movies.' })
      navigate('/login')
      return
    }

    try {
      const data = await api.createMovie(
        {
          title: values.title.trim(),
          year: Number(values.year),
          genre: values.genre.trim(),
          poster: values.poster.trim(),
          summary: values.summary.trim(),
        },
        session.token,
      )
      const payload = normalizeMovie(data?.data || data)
      if (payload) {
        setMovies((prev) => [payload, ...prev])
        setActiveMovie(payload)
        setNotice({ type: 'success', text: 'Movie created.' })
        navigate(`/movies/${payload.id}`)
      }
    } catch (error) {
      setNotice({ type: 'error', text: error.message })
    }
  }

  const handleUpdateMovie = async (movieId, values) => {
    if (!session?.token) {
      setNotice({ type: 'error', text: 'Please login to edit movies.' })
      navigate('/login')
      return
    }

    try {
      const data = await api.updateMovie(
        movieId,
        {
          title: values.title.trim(),
          year: Number(values.year),
          genre: values.genre.trim(),
          poster: values.poster.trim(),
          summary: values.summary.trim(),
        },
        session.token,
      )
      const payload = normalizeMovie(data?.data || data)
      if (payload) {
        setMovies((prev) =>
          prev.map((movie) => (movie.id === movieId ? payload : movie)),
        )
        setActiveMovie(payload)
        setNotice({ type: 'success', text: 'Movie updated.' })
        navigate(`/movies/${movieId}`)
      }
    } catch (error) {
      setNotice({ type: 'error', text: error.message })
    }
  }

  const handleDeleteMovie = async (movieId) => {
    const target = movies.find((movie) => movie.id === movieId)
    if (!target) return

    if (!session?.token) {
      setNotice({ type: 'error', text: 'Please login to delete movies.' })
      navigate('/login')
      return
    }

    const confirmed = window.confirm(
      `Delete "${target.title}"? This cannot be undone.`,
    )
    if (!confirmed) return

    try {
      await api.deleteMovie(movieId, session.token)
      setMovies((prev) => prev.filter((movie) => movie.id !== movieId))
      setActiveMovie(null)
      setNotice({ type: 'success', text: 'Movie deleted.' })
      navigate('/')
    } catch (error) {
      setNotice({ type: 'error', text: error.message })
    }
  }

  const handleAddComment = async (movieId, text) => {
    if (!session?.token) {
      setNotice({ type: 'error', text: 'Login to post a comment.' })
      navigate('/login')
      return
    }

    try {
      const data = await api.addComment(
        movieId,
        { content: text.trim() },
        session.token,
      )
      const payload = normalizeComment(data?.data || data)
      if (payload) {
        setActiveComments((prev) => [payload, ...prev])
      }
    } catch (error) {
      setNotice({ type: 'error', text: error.message })
    }
  }

  let content = null

  if (route.page === 'home') {
    content = (
      <Home
        movies={sortedMovies}
        currentUser={currentUser}
        onCreate={() => navigate('/create')}
        loading={loading}
      />
    )
  }

  if (route.page === 'login') {
    content = (
      <AuthForm
        title="Welcome back"
        subtitle="Sign in to manage your collection."
        submitLabel="Login"
        onSubmit={handleLogin}
        fields={[
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'password', label: 'Password', type: 'password' },
        ]}
        footer={
          <span>
            New here? <a href="#/register">Create an account</a>
          </span>
        }
      />
    )
  }

  if (route.page === 'register') {
    content = (
      <AuthForm
        title="Create account"
        subtitle="Build your own curated list of films."
        submitLabel="Register"
        onSubmit={handleRegister}
        fields={[
          { name: 'name', label: 'Username' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'password', label: 'Password', type: 'password' },
        ]}
        footer={
          <span>
            Already have an account? <a href="#/login">Login</a>
          </span>
        }
      />
    )
  }

  if (route.page === 'create') {
    content = currentUser ? (
      <MovieForm
        title="Add a movie"
        subtitle="Share a new pick with the community."
        submitLabel="Create movie"
        onSubmit={handleCreateMovie}
        onCancel={() => navigate('/')}
        initialValues={{
          title: '',
          year: '',
          genre: '',
          poster: '',
          summary: '',
        }}
      />
    ) : (
      <Restricted message="Login to create new movies." />
    )
  }

  if (route.page === 'details') {
    const movie = activeMovie || movies.find((entry) => entry.id === route.movieId)
    content = (
      <MovieDetails
        movie={movie}
        comments={activeComments}
        currentUser={currentUser}
        onDelete={handleDeleteMovie}
        onAddComment={handleAddComment}
      />
    )
  }

  if (route.page === 'edit') {
    const movie = activeMovie || movies.find((entry) => entry.id === route.movieId)
    if (!movie) {
      content = <NotFound />
    } else if (currentUser?.id !== movie.ownerId) {
      content = <Restricted message="Only the owner can edit this movie." />
    } else {
      content = (
        <MovieForm
          title="Edit movie"
          subtitle="Update the details of your movie entry."
          submitLabel="Save changes"
          onSubmit={(values) => handleUpdateMovie(movie.id, values)}
          onCancel={() => navigate(`/movies/${movie.id}`)}
          initialValues={{
            title: movie.title,
            year: movie.year,
            genre: movie.genre,
            poster: movie.poster,
            summary: movie.summary,
          }}
        />
      )
    }
  }

  if (route.page === 'notfound') {
    content = <NotFound />
  }

  return (
    <div className="app">
      <Header currentUser={currentUser} onLogout={handleLogout} />
      <main className="main">
        {notice && (
          <div className={`notice ${notice.type}`}>{notice.text}</div>
        )}
        {content}
      </main>
      <footer className="footer">
        <span>Movie list demo built with React and a REST backend.</span>
      </footer>
    </div>
  )
}

function Header({ currentUser, onLogout }) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark">CineShelf</span>
        <span className="brand-tag">Curated movie notes</span>
      </div>
      <nav className="nav">
        <a href="#/">Movies</a>
        {currentUser && <a href="#/create">Add Movie</a>}
      </nav>
      <div className="auth">
        {currentUser ? (
          <>
            <span className="user-pill">Hi {currentUser.username}</span>
            <button type="button" className="button ghost" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <a className="button ghost" href="#/login">
              Login
            </a>
            <a className="button primary" href="#/register">
              Register
            </a>
          </>
        )}
      </div>
    </header>
  )
}

function Home({ movies, currentUser, onCreate, loading }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return movies
    return movies.filter(
      (movie) =>
        movie.title.toLowerCase().includes(normalized) ||
        movie.genre.toLowerCase().includes(normalized),
    )
  }, [movies, query])

  return (
    <section className="page">
      <div className="hero">
        <div>
          <h1>Organize the movies you love.</h1>
          <p>
            Create your own library, add thoughts, and keep track of what to
            watch next.
          </p>
        </div>
        <div className="hero-actions">
          {currentUser ? (
            <button type="button" className="button primary" onClick={onCreate}>
              Add a movie
            </button>
          ) : (
            <a className="button primary" href="#/register">
              Start your list
            </a>
          )}
          {!currentUser && (
            <a className="button ghost" href="#/login">
              Sign in
            </a>
          )}
        </div>
      </div>

      <div className="toolbar">
        <div className="search">
          <input
            type="search"
            placeholder="Search by title or genre"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="pill">
          {movies.length} {movies.length === 1 ? 'movie' : 'movies'}
        </div>
      </div>

      {loading ? (
        <div className="empty">Loading movies...</div>
      ) : filtered.length === 0 ? (
        <div className="empty">No movies match your search yet.</div>
      ) : (
        <div className="grid">
          {filtered.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </section>
  )
}

function MovieCard({ movie }) {
  return (
    <article className="card">
      <div
        className={`poster ${movie.poster ? '' : 'placeholder'}`}
        style={movie.poster ? { backgroundImage: `url(${movie.poster})` } : {}}
      >
        {!movie.poster && <span>{movie.title.slice(0, 1)}</span>}
      </div>
      <div className="card-body">
        <div className="card-top">
          <h3>{movie.title}</h3>
          <span>{movie.year}</span>
        </div>
        <p>{movie.summary}</p>
      </div>
      <div className="card-footer">
        <span className="chip">{movie.genre}</span>
        <a className="link" href={`#/movies/${movie.id}`}>
          Details
        </a>
      </div>
    </article>
  )
}

function MovieDetails({ movie, comments, currentUser, onDelete, onAddComment }) {
  const [commentText, setCommentText] = useState('')

  if (!movie) return <NotFound />

  const isOwner = currentUser?.id === movie.ownerId

  const submitComment = (event) => {
    event.preventDefault()
    if (!commentText.trim()) return
    onAddComment(movie.id, commentText)
    setCommentText('')
  }

  const sortedComments = [...comments].sort((a, b) =>
    String(b.createdAt).localeCompare(String(a.createdAt)),
  )

  return (
    <section className="page">
      <div className="details">
        <div
          className={`poster details-poster ${movie.poster ? '' : 'placeholder'}`}
          style={movie.poster ? { backgroundImage: `url(${movie.poster})` } : {}}
        >
          {!movie.poster && <span>{movie.title.slice(0, 1)}</span>}
        </div>
        <div className="details-body">
          <div className="details-top">
            <div>
              <h2>{movie.title}</h2>
              <div className="details-meta">
                <span>{movie.year}</span>
                <span>•</span>
                <span>{movie.genre}</span>
                <span>•</span>
                <span>Added {formatDate(movie.createdAt)}</span>
              </div>
            </div>
            {isOwner && (
              <div className="details-actions">
                <a className="button ghost" href={`#/movies/${movie.id}/edit`}>
                  Edit
                </a>
                <button
                  type="button"
                  className="button danger"
                  onClick={() => onDelete(movie.id)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
          <p className="details-summary">{movie.summary}</p>
        </div>
      </div>

      <div className="comments">
        <div className="comments-header">
          <h3>Comments</h3>
          <span className="pill">{comments.length}</span>
        </div>

        <div className="comment-list">
          {sortedComments.length === 0 ? (
            <div className="empty">No comments yet. Start the conversation.</div>
          ) : (
            sortedComments.map((comment) => (
              <div key={comment.id} className="comment">
                <div className="comment-top">
                  <span>{comment.authorName}</span>
                  <span>{formatDate(comment.createdAt)}</span>
                </div>
                <p>{comment.text}</p>
              </div>
            ))
          )}
        </div>

        {currentUser ? (
          <form className="comment-form" onSubmit={submitComment}>
            <textarea
              rows="3"
              placeholder="Share your thoughts"
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
            />
            <div className="comment-actions">
              <span className="hint">
                Commenting as {currentUser.username}
              </span>
              <button type="submit" className="button primary">
                Post comment
              </button>
            </div>
          </form>
        ) : (
          <div className="empty">
            <a href="#/login">Login</a> to add a comment.
          </div>
        )}
      </div>
    </section>
  )
}

function MovieForm({ title, subtitle, submitLabel, onSubmit, onCancel, initialValues }) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues])

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = {}

    if (!values.title.trim()) nextErrors.title = 'Title is required'
    if (!values.year || Number(values.year) < 1888)
      nextErrors.year = 'Enter a valid year'
    if (!values.genre.trim()) nextErrors.genre = 'Genre is required'
    if (!values.summary.trim()) nextErrors.summary = 'Summary is required'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onSubmit(values)
  }

  return (
    <section className="page">
      <div className="panel">
        <div className="panel-head">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              value={values.title}
              onChange={handleChange}
              placeholder="Movie title"
            />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="year">Year</label>
              <input
                id="year"
                name="year"
                type="number"
                value={values.year}
                onChange={handleChange}
                placeholder="2024"
              />
              {errors.year && <span className="field-error">{errors.year}</span>}
            </div>
            <div className="field">
              <label htmlFor="genre">Genre</label>
              <input
                id="genre"
                name="genre"
                value={values.genre}
                onChange={handleChange}
                placeholder="Drama"
              />
              {errors.genre && <span className="field-error">{errors.genre}</span>}
            </div>
          </div>
          <div className="field">
            <label htmlFor="poster">Poster URL</label>
            <input
              id="poster"
              name="poster"
              value={values.poster}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>
          <div className="field">
            <label htmlFor="summary">Summary</label>
            <textarea
              id="summary"
              name="summary"
              rows="4"
              value={values.summary}
              onChange={handleChange}
              placeholder="Short synopsis"
            />
            {errors.summary && (
              <span className="field-error">{errors.summary}</span>
            )}
          </div>
          <div className="form-actions">
            <button type="submit" className="button primary">
              {submitLabel}
            </button>
            <button type="button" className="button ghost" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

function AuthForm({ title, subtitle, submitLabel, onSubmit, fields, footer }) {
  const initialState = fields.reduce((acc, field) => {
    acc[field.name] = ''
    return acc
  }, {})

  const [values, setValues] = useState(initialState)

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit(values)
  }

  return (
    <section className="page">
      <div className="panel auth-panel">
        <div className="panel-head">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div className="field" key={field.name}>
              <label htmlFor={field.name}>{field.label}</label>
              <input
                id={field.name}
                name={field.name}
                type={field.type || 'text'}
                value={values[field.name]}
                onChange={handleChange}
              />
            </div>
          ))}
          <button type="submit" className="button primary full">
            {submitLabel}
          </button>
        </form>
        <div className="panel-footer">{footer}</div>
      </div>
    </section>
  )
}

function NotFound() {
  return (
    <section className="page">
      <div className="empty">
        <h3>Page not found</h3>
        <p>We could not find that page.</p>
        <a className="button ghost" href="#/">
          Back to movies
        </a>
      </div>
    </section>
  )
}

function Restricted({ message }) {
  return (
    <section className="page">
      <div className="empty">
        <h3>Access restricted</h3>
        <p>{message}</p>
        <a className="button ghost" href="#/">
          Back to movies
        </a>
      </div>
    </section>
  )
}

export default App
