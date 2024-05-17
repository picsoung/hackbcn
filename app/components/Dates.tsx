import { useIntl } from "./Intl";

export default function Dates() {
  const intl = useIntl();

  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto px-8">
        <h3 className="text-3xl sm:text-5xl font-cal font-semibold text-white">
          {intl.t("schedule.dates")}
        </h3>
        <p className="mt-4 text-xl text-gray-200">
          <span className="font-semibold">{intl.t('schedule.hacking')}: </span>{intl.t('schedule.hacking-time')}
          <br />
          {/* <span className="font-semibold">Internal Demo Fair: </span>
          March 24, 3:45 PM
          <br /> */}
          <span className="font-semibold pr-1">
            {intl.t('schedule.demo')}:
          </span>
          {intl.t('schedule.demo-time')}
        </p>
      </div>
    </div>
  );
}
