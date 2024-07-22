import React from 'react'
import Link from 'next/link'
import {
  FaSquareXTwitter,
  FaLinkedin,
  FaLink,
  FaMedium,
  FaGithub,
} from 'react-icons/fa6'
interface LinkIconProps {
  linkURL?: string
  linkType: string
  showText: boolean
}

const LinkIcon: React.FC<LinkIconProps> = ({
  linkURL = 'hackbarna.com',
  linkType = 'website',
  showText,
}) => {
  const getIcon = () => {
    switch (linkType) {
      case 'twitter':
        return <FaSquareXTwitter className="text-3xl" />
      case 'linkedin':
        return <FaLinkedin className="text-3xl" />
      case 'website':
        return <FaLink className="text-3xl" />
      case 'github':
        return <FaGithub className="text-3xl" />
      case 'medium':
        return <FaMedium className="text-3xl" />
      default:
        return null
    }
  }

  console.log('linkURL', linkURL, linkType, showText)
  return (
    <Link href={linkURL}>
      <div className="flex items-center">
        {getIcon()}
        {showText && <span className="ml-2">{linkType}</span>}
      </div>
    </Link>
  )
}

export default LinkIcon
