export default function Team() {
  return (
    <div id="about" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="mt-2 text-3xl font-cal text-indigo-600 sm:text-5xl">
            Organizing Team
          </h2>
        </div>
        <div className="flex mt-6 text-gray-700">
          <div className="w-1/2 mr-8">
            <div>IvyHacks is brought to you by:</div>
            <br />
            <div>
              <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
                {[
                  { firstName: "Andrew", lastName: "Siah" },
                  { firstName: "Jan", lastName: "Carbonell" },
                  { firstName: "Iris", lastName: "Meng" },
                  { firstName: "Sudhanshu", lastName: "Pandey" },
                ].map((name, index) => (
                  <li
                    key={index}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span style={{ justifySelf: "end", paddingRight: "1rem" }}>
                      {name.firstName}
                    </span>
                    <span style={{ justifySelf: "start" }}>
                      {name.lastName}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <br />
            <br />
            This hackathon wouldn&apos;t be possible without the incredible
            support of our universities, our sponsors, volunteers and YOU!
          </div>
          <div className="w-1/2 ml-8">
            Feel free to reach out if you have any questions:
            <br />
            <br />
            andrew.siah@columbia.edu
            <br />
            +1 917-498-9356
            <br />
          </div>
        </div>
      </div>
    </div>
  );
}
