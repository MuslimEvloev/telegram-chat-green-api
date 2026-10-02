import styles from './Avatar.module.css'

// Градиенты аватаров Telegram
const GRADIENTS = [
  ['#ff885e', '#ff516a'],
  ['#ffcd6a', '#ffa85c'],
  ['#82b1ff', '#665fff'],
  ['#a0de7e', '#54cb68'],
  ['#53edd6', '#28c9b7'],
  ['#72d5fd', '#2a9ef1'],
  ['#e0a2f3', '#d669ed'],
]

interface AvatarProps {
  id: string
  title: string
  size?: number
}

export function Avatar({ id, title, size = 54 }: AvatarProps) {
  const hash = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const [top, bottom] = GRADIENTS[hash % GRADIENTS.length]
  const initial = title.match(/[\p{L}\p{N}]/u)?.[0].toUpperCase()

  return (
    <span
      className={styles.avatar}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        backgroundImage: `linear-gradient(${top}, ${bottom})`,
      }}
      aria-hidden="true"
    >
      {initial}
    </span>
  )
}
