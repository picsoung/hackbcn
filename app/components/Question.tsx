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
          <Disclosure.Button className="flex w-full items-start text-left text-indigo-500  ">
            {title}
            <ChevronRightIcon
              className={`h-6 w-6 ${open ? 'rotate-90 transform' : ''}`}
            />
          </Disclosure.Button>
          <Disclosure.Panel>
            <ReactMarkdown remarkPlugins={[gfm, remarkBreaks]}>
              {answer}
            </ReactMarkdown>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}
