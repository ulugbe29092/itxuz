/**
 * Barcha kurs uchun to'g'ri SVG logolar
 * slug → { svg, color, bg }
 */

const logos = {
  'html-css': {
    color: '#e44d26',
    bg: '#e44d2618',
    svg: (
      <svg viewBox="0 0 48 48" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <path fill="#E44D26" d="M7 5l2.5 28L24 37l14.5-4L41 5z"/>
        <path fill="#F16529" d="M24 35.5V8H38.5L36.3 31.5z"/>
        <path fill="#EBEBEB" d="M24 20h-6.5l-.4-4.5H24V11H13l1.2 13.5H24zm0 9.5l-.1.1-5-1.4-.3-3.6H14l.6 6.5 9.4 2.6z"/>
        <path fill="#fff" d="M24 20v4.5h6l-.6 6-5.4 1.5V36l9.4-2.6 1.1-13.4zm0-9v4.5h12.5l.4-4.5z"/>
      </svg>
    ),
  },
  javascript: {
    color: '#f7df1e',
    bg: '#f7df1e18',
    svg: (
      <svg viewBox="0 0 48 48" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="4" fill="#F7DF1E"/>
        <path fill="#323330" d="M13 36.5l3.4-2c.6 1.1 1.2 2 2.5 2 1.3 0 2-.5 2-2.5V21h4.2v13.2c0 4.1-2.4 6-5.9 6-3.1 0-4.9-1.6-5.8-3.7zm13.5-.5l3.4-2c.9 1.5 2 2.6 4 2.6 1.7 0 2.7-.8 2.7-2 0-1.4-1.1-1.9-2.9-2.7l-1-.4c-2.9-1.2-4.8-2.8-4.8-6 0-3 2.3-5.2 5.8-5.2 2.5 0 4.3.9 5.6 3.2l-3.3 2.1c-.7-1.2-1.4-1.7-2.5-1.7-1.1 0-1.9.7-1.9 1.7 0 1.2.7 1.7 2.4 2.4l1 .4c3.4 1.5 5.3 3 5.3 6.3 0 3.6-2.8 5.5-6.6 5.5-3.7 0-6-1.8-7.2-4.2z"/>
      </svg>
    ),
  },
  python: {
    color: '#3776ab',
    bg: '#3776ab18',
    svg: (
      <svg viewBox="0 0 48 48" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <path fill="#3776AB" d="M24.1 5C13.8 5 14.4 9.5 14.4 9.5l.1 4.7h9.9v1.4H10.8S5 14.9 5 25.3s5.1 10 5.1 10h3v-4.8s-.2-5.1 5-5.1h8.6s4.8.1 4.8-4.7V9.9S32.3 5 24.1 5zm-4.8 2.8c.9 0 1.6.7 1.6 1.6s-.7 1.6-1.6 1.6-1.6-.7-1.6-1.6.7-1.6 1.6-1.6z"/>
        <path fill="#FFD43B" d="M24.2 43c10.3 0 9.7-4.5 9.7-4.5l-.1-4.7H23.9v-1.4h13.6S43 33.1 43 22.7s-5.1-10-5.1-10h-3v4.8s.2 5.1-5 5.1h-8.6s-4.8-.1-4.8 4.7v8.8S15.7 43 24.2 43zm4.8-2.8c-.9 0-1.6-.7-1.6-1.6s.7-1.6 1.6-1.6 1.6.7 1.6 1.6-.7 1.6-1.6 1.6z"/>
      </svg>
    ),
  },
  reactjs: {
    color: '#61dafb',
    bg: '#61dafb18',
    svg: (
      <svg viewBox="0 0 48 48" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <circle fill="#61DAFB" cx="24" cy="24" r="4"/>
        <g fill="none" stroke="#61DAFB" strokeWidth="2">
          <ellipse rx="16" ry="6" cx="24" cy="24"/>
          <ellipse rx="16" ry="6" cx="24" cy="24" transform="rotate(60 24 24)"/>
          <ellipse rx="16" ry="6" cx="24" cy="24" transform="rotate(120 24 24)"/>
        </g>
      </svg>
    ),
  },
  nodejs: {
    color: '#339933',
    bg: '#33993318',
    svg: (
      <svg viewBox="0 0 48 48" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <path fill="#339933" d="M24 4L6 14v20l18 10 18-10V14L24 4zm0 3.5l14 7.8v15.4L24 38.5 10 30.7V15.3L24 7.5z"/>
        <path fill="#339933" d="M24 13c-6.1 0-11 4.9-11 11s4.9 11 11 11 11-4.9 11-11-4.9-11-11-11zm0 18c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7z"/>
      </svg>
    ),
  },
  'sql-postgresql': {
    color: '#336791',
    bg: '#33679118',
    svg: (
      <svg viewBox="0 0 48 48" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <ellipse fill="#336791" cx="24" cy="12" rx="14" ry="6"/>
        <path fill="#336791" d="M10 12v8c0 3.3 6.3 6 14 6s14-2.7 14-6v-8c0 3.3-6.3 6-14 6s-14-2.7-14-6z"/>
        <path fill="#336791" d="M10 20v8c0 3.3 6.3 6 14 6s14-2.7 14-6v-8c0 3.3-6.3 6-14 6s-14-2.7-14-6z"/>
        <path fill="#336791" d="M10 28v8c0 3.3 6.3 6 14 6s14-2.7 14-6v-8c0 3.3-6.3 6-14 6s-14-2.7-14-6z"/>
        <ellipse fill="#fff" fillOpacity=".3" cx="24" cy="12" rx="14" ry="6"/>
      </svg>
    ),
  },
  'git-github': {
    color: '#f05032',
    bg: '#f0503218',
    svg: (
      <svg viewBox="0 0 48 48" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <path fill="#F05032" d="M44 21.7L26.3 4c-.9-1-2.4-1-3.3 0l-3.7 3.7 4.7 4.7c1-.4 2.2-.2 3 .6.9.9 1.1 2.1.6 3.1l4.5 4.5c1-.4 2.2-.2 3.1.6 1.2 1.2 1.2 3.1 0 4.3-1.2 1.2-3.1 1.2-4.3 0-.9-.9-1.1-2.2-.6-3.3l-4.2-4.2v11c.7.3 1.4.9 1.8 1.6 1.2 1.2 1.2 3.1 0 4.3-1.2 1.2-3.1 1.2-4.3 0-1.2-1.2-1.2-3.1 0-4.3.5-.5 1.1-.9 1.8-1.1V17.8c-.7-.3-1.3-.6-1.8-1.1-.9-.9-1.1-2.2-.6-3.3L18.8 9 4 23.8c-.9.9-.9 2.4 0 3.3l17.7 17.7c.9.9 2.4.9 3.3 0L44 25c.9-.9.9-2.4 0-3.3z"/>
      </svg>
    ),
  },
  'linux-terminal': {
    color: '#fcc624',
    bg: '#fcc62418',
    svg: (
      <svg viewBox="0 0 48 48" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <path fill="#FCC624" d="M24 4C13 4 4 13 4 24s9 20 20 20 20-9 20-20S35 4 24 4z"/>
        <path fill="#333" d="M16 14h4v12h-4zm12 0h4v12h-4zm-8 14h8v4h-8z"/>
        <path fill="#333" d="M13 32h22v4H13z"/>
      </svg>
    ),
  },
  'docker-devops': {
    color: '#2496ed',
    bg: '#2496ed18',
    svg: (
      <svg viewBox="0 0 48 48" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <path fill="#2496ED" d="M42.5 20c-.4-.3-1.5-.7-3.3-.7-.6 0-1.2.1-1.8.2-.4-3-2.5-5.5-4.6-7l-.9-.6-.6.9c-.8 1.2-1.2 2.7-1.3 4-.3 1.6 0 3.3.7 4.6-1 .6-2.2.8-3.3.8H5c-.4 2.2 0 5.2 1.5 7.5 1.5 2.1 3.7 3.1 6.7 3.1 6.7 0 11.7-3 14.2-8.2.9 0 3 0 4-2 .1-.2.7-1.5.7-2.2l-1.1-.4z"/>
        <rect fill="#2496ED" x="7" y="21" width="4" height="4" rx="1"/>
        <rect fill="#2496ED" x="13" y="21" width="4" height="4" rx="1"/>
        <rect fill="#2496ED" x="19" y="21" width="4" height="4" rx="1"/>
        <rect fill="#2496ED" x="13" y="15" width="4" height="4" rx="1"/>
        <rect fill="#2496ED" x="19" y="15" width="4" height="4" rx="1"/>
        <rect fill="#2496ED" x="25" y="15" width="4" height="4" rx="1"/>
        <rect fill="#2496ED" x="19" y="9" width="4" height="4" rx="1"/>
      </svg>
    ),
  },
  vuejs: {
    color: '#42b883',
    bg: '#42b88318',
    svg: (
      <svg viewBox="0 0 48 48" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <path fill="#42B883" d="M24 42L2 8h9l13 22 13-22h9z"/>
        <path fill="#35495E" d="M24 42L13 22h-4l15 20zm0 0l11-20h4L24 42z"/>
      </svg>
    ),
  },
  typescript: {
    color: '#3178c6',
    bg: '#3178c618',
    svg: (
      <svg viewBox="0 0 48 48" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="4" fill="#3178C6"/>
        <path fill="#fff" d="M27 26v2.7c.7.4 1.5.6 2.5.6.9 0 1.5-.2 2-.6.4-.4.7-.9.7-1.5 0-.6-.2-1.1-.6-1.5-.4-.4-1.1-.8-2.2-1.2-1.4-.5-2.4-1-3-1.8-.6-.7-.9-1.6-.9-2.7 0-1.3.5-2.3 1.4-3 .9-.8 2.1-1.2 3.6-1.2 1.4 0 2.5.3 3.5.8v2.6c-.9-.6-1.9-.9-3-.9-.8 0-1.5.2-1.9.6-.4.4-.7.9-.7 1.4 0 .6.2 1 .6 1.3.4.3 1.1.7 2.1 1.1 1.5.6 2.5 1.2 3.2 1.9.6.7 1 1.6 1 2.8 0 1.4-.5 2.4-1.4 3.2-.9.7-2.2 1.1-3.7 1.1-1.5 0-2.8-.3-3.9-.9zM12 21H8v-2.5h12V21h-4v12h-4V21z"/>
      </svg>
    ),
  },
  mongodb: {
    color: '#47a248',
    bg: '#47a24818',
    svg: (
      <svg viewBox="0 0 48 48" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <path fill="#47A248" d="M24 4c-1.5 6-4.5 9-4.5 15 0 3.7 2 7 4.5 9 2.5-2 4.5-5.3 4.5-9C28.5 13 25.5 10 24 4z"/>
        <path fill="#47A248" d="M24 44V28c2.5-2 4.5-5.3 4.5-9C28.5 13 25.5 10 24 4c-1.5 6-4.5 9-4.5 15 0 3.7 2 7 4.5 9v16z"/>
        <path fill="#A8C6A0" d="M25.5 28.5c0 0-.5 8.5-.5 15.5h-2c0-7 .5-15.5.5-15.5h2z"/>
      </svg>
    ),
  },
  'flutter-dart': {
    color: '#54c5f8',
    bg: '#54c5f818',
    svg: (
      <svg viewBox="0 0 48 48" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <path fill="#54C5F8" d="M21 4L6 19l5 5 15-15z"/>
        <path fill="#01579B" d="M21 4l5 5-9 9-5-5z"/>
        <path fill="#54C5F8" d="M11 24l5 5-5 5-5-5z"/>
        <path fill="#29B6F6" d="M16 29l5 5-5 5-5-5z"/>
        <path fill="#01579B" d="M16 29l5-5 5 5-5 5z"/>
      </svg>
    ),
  },
  'machine-learning': {
    color: '#ff6b6b',
    bg: '#ff6b6b18',
    svg: (
      <svg viewBox="0 0 48 48" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <circle fill="none" stroke="#FF6B6B" strokeWidth="2.5" cx="24" cy="24" r="5"/>
        <circle fill="none" stroke="#FF6B6B" strokeWidth="2" cx="24" cy="24" r="11"/>
        <circle fill="none" stroke="#FF6B6B" strokeWidth="1.5" cx="24" cy="24" r="18"/>
        <circle fill="#FF6B6B" cx="24" cy="6" r="2.5"/>
        <circle fill="#FF6B6B" cx="24" cy="42" r="2.5"/>
        <circle fill="#FF6B6B" cx="6" cy="24" r="2.5"/>
        <circle fill="#FF6B6B" cx="42" cy="24" r="2.5"/>
        <circle fill="#FF6B6B" cx="11" cy="11" r="2"/>
        <circle fill="#FF6B6B" cx="37" cy="37" r="2"/>
        <circle fill="#FF6B6B" cx="37" cy="11" r="2"/>
        <circle fill="#FF6B6B" cx="11" cy="37" r="2"/>
      </svg>
    ),
  },
  cybersecurity: {
    color: '#ef4444',
    bg: '#ef444418',
    svg: (
      <svg viewBox="0 0 48 48" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <path fill="#EF4444" d="M24 4L6 11v13c0 9 7.5 17.4 18 20 10.5-2.6 18-11 18-20V11L24 4z"/>
        <path fill="#fff" d="M21 30l-6-6 2.1-2.1 3.9 3.9 8.9-8.9L32 19z"/>
      </svg>
    ),
  },
}

/**
 * Kurs slug bo'yicha logo qaytaradi
 * @param {string} slug - kurs slug
 * @param {number} size - icon o'lchami (default 32)
 */
export function getCourseLogo(slug, size = 32) {
  const entry = logos[slug]
  if (!entry) {
    // Default icon
    return {
      color: '#6366f1',
      bg: '#6366f118',
      svg: (
        <svg viewBox="0 0 48 48" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="48" rx="8" fill="#6366f1" fillOpacity=".2"/>
          <path fill="#6366f1" d="M16 14h16v4H16zm0 8h16v4H16zm0 8h10v4H16z"/>
        </svg>
      ),
    }
  }
  // Resize if needed
  if (size !== 32) {
    return {
      ...entry,
      svg: (
        <svg viewBox="0 0 48 48" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
          {entry.svg.props.children}
        </svg>
      ),
    }
  }
  return entry
}

export default logos
