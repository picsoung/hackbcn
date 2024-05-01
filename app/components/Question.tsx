import { Disclosure } from "@headlessui/react";
import { ChevronRightIcon } from "@heroicons/react/20/solid";

interface QuestionProps {
  title: string;
  answer: string;
}

export default function Question({ title, answer }: QuestionProps) {
  return (
    <Disclosure as="div" className="pt-6">
      {({ open }) => (
        /* Use the `open` state to conditionally change the direction of an icon. */
        <>
          <Disclosure.Button className="flex w-full items-start text-left text-indigo-500  ">
            {title}
            <ChevronRightIcon className={`h-6 w-6 ${open ? "rotate-90 transform" : ""}`}  />
          </Disclosure.Button>
          <Disclosure.Panel>{answer}</Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
