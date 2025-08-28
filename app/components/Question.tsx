import { Disclosure } from '@headlessui/react'
import { ChevronRightIcon } from '@heroicons/react/20/solid'

import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

interface QuestionProps {
  title: string
  answer: string
}

export default function Question({ title, answer }: QuestionProps) {
  return (
    <Disclosure as="div" className="pt-6">
      {({ open }) => (
        /* Use the `open` state to conditionally change the direction of an icon. */
        <>
          <Disclosure.Button className="flex w-full items-start text-left text-indigo-500 font-medium">
            {title}
            <ChevronRightIcon
              className={`h-6 w-6 ml-2 flex-shrink-0 ${open ? 'rotate-90 transform' : ''}`}
            />
          </Disclosure.Button>
          <Disclosure.Panel className="mt-2 text-gray-700">
            <ReactMarkdown 
              remarkPlugins={[gfm, remarkBreaks]}
              className="prose prose-sm max-w-none text-gray-700"
            >
              {answer}
            </ReactMarkdown>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}
