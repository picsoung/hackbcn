"use client";

import { useIntl } from "./Intl";

export default function ApplyButton() {
  const intl = useIntl();
  function handleClick(): void {
    const formless = document.querySelector('.formless-trigger') as HTMLElement | null;
    if (formless) {
      formless.click();
      formless.style.display = 'block';
    }
  }

  return (
    <>
      <h3 className="inline-flex items-center px-3 py-2 border border-transparent text-lg font-medium rounded-md text-gray-200 bg-amber-800 hover:bg-indigo-700 hover:text-white">Application closed</h3>
      {/* <button
      onClick={handleClick}
        className="inline-flex items-center px-3 py-2 border border-transparent text-lg font-medium rounded-md text-gray-200 bg-amber-500 hover:bg-indigo-700 hover:text-white"
      >
        {intl.t("action.apply")}
      </button> */}
    </>
  );
}
