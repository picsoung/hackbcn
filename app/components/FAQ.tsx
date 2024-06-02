import { useIntl } from "./Intl";
import Question from "./Question";

const QUESTIONS = (intl: ReturnType<typeof useIntl>) => new Array(9).fill(0).map((_, index) => ({
  title: intl.t(`faq.item.${index}.title`),
  answer: intl.t(`faq.item.${index}.answer`),
  category: intl.t(`faq.item.${index}.category`),
}));

export default function FAQ({ padding = false }) {
  const intl = useIntl();
  type Question = { title: string; answer: string };

  return (
    <div id="faq" className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:py-10 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-7xl divide-y divide-orange-900/10">
          <h2 className="text-3xl sm:text-5xl font-cal font-semibold text-indigo-600">
            {intl.t('faq.title')}
          </h2>
          <div className={`${padding ? "faq-padding" : ""} grid grid-cols-2 gap-4`}>
            {QUESTIONS(intl).map((q, index) => (
              <Question key={index} title={q.title} answer={q.answer} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
