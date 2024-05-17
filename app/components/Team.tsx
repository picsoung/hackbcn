import { useIntl } from "./Intl";

export default function Team() {
  const intl = useIntl();
  return (
    <div id="about" className="bg-white py-10 sm:py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="mt-1 text-3xl sm:text-5xl font-cal font-semibold text-indigo-600">
            {intl.t("team.title")}
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row mt-6 text-gray-800 text-lg">
          <div className="w-full sm:w-1/2 mr-8">
            <div>{intl.t("team.intro")}</div>
            <br />
            <div>
              <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
                {[
                  { firstName: "Nicolas", lastName: "Grenié", link: 'https://www.linkedin.com/in/nicolasgrenie/' },
                  // { firstName: "Jan", lastName: "Carbonell" },
                  // { firstName: "Iris", lastName: "Meng" },
                  // { firstName: "Sudhanshu", lastName: "Pandey" },
                ].map((name, index) => (
                  <li
                    key={index}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr",
                      marginBottom: "0.5rem",
                      marginLeft: "5rem",
                    }}
                  >
                    <a href={name.link}>{name.firstName} {name.lastName}</a>
                  </li>
                ))}
              </ul>
            </div>
            <br />
            {intl.t("team.thanks")}
          </div>
          <div className="w-full sm:w-1/2 mt-6 sm:mt-0">
            {intl.t("team.contact")}
            <br />
            team@hackbcn.com
          </div>
        </div>
      </div>
    </div>
  );
}