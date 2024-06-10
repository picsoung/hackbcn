import Image from "next/image";
import React from "react"; // Import React if you haven't already
import { useIntl } from "./Intl";
export default function Sponsors() {
  const intl = useIntl();
  return (
    <div id="sponsors" className="bg-white py-10 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <h2 className="mt-2 text-3xl sm:text-5xl font-cal font-semibold text-indigo-600">
          {intl.t("sponsors.title")}
        </h2>
        <div className="flex flex-col flex-wrap justify-center items-center mx-auto gap-4 mt-12">
          <div className="relative flex flex-wrap gap-4 items-center">
            <a href="https://huggingface.co/" target="_blank" rel="hackbcn">
              <Image
                className="h-auto max-h-32 object-contain"
                src="/logos/mistral.svg"
                width={300}
                height={32}
                alt="Huggingface logo"
              />
            </a>
            <a href="https://mistral.ai/" target="_blank" rel="hackbcn">
              <Image
                className="h-auto max-h-32 object-contain"
                src="/logos/hf.png"
                width={300}
                height={32}
                alt="mistralai"
              />
            </a>
            <a href="https://algolia.com/" target="_blank" rel="hackbcn">
              <Image
                className="h-auto max-h-32 object-contain"
                src="/logos/algolia.png"
                width={300}
                height={32}
                alt="Algolia"
              />
            </a>
            <a href="https://replexica.com/" target="_blank" rel="hackbcn">
              <Image
                className="h-auto max-h-32 object-contain"
                src="/logos/replexica.png"
                width={300}
                height={32}
                alt="Replexica"
              />
            </a>
            <a href="https://www.inno-it.es" target="_blank">
              <Image
                className="h-auto max-h-32 object-contain"
                src="/logos/community/innoit_black.png"
                alt="InnoIT"
                width={300}
                height={32}
              />
            </a>
            <a href="https://www.resend.com" target="_blank" rel="">
              <Image
                className="h-auto max-h-32 object-contain"
                src="/logos/resend.png"
                width={300}
                height={32}
                alt="Resend"
              />
            </a>
            <a href="https://www.lewagon.com/barcelona" target="_blank" rel="">
              <Image
                className="h-auto max-h-32 object-contain"
                src="/logos/lewagon.png"
                width={300}
                height={32}
                alt="LeWagon"
              />
            </a>
            <a target="_blank" href="https://hackbcn.com/sponsorship.pdf">
              <Image
                className="h-auto max-h-40 object-contain bg-black hover:cursor-pointer"
                src="/cards/yourcompany.png"
                width={100}
                height={32}
                alt="Your Company"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
