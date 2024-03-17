export default function Team() {
  return (
    <div id="about" className="bg-white py-10 sm:py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="mt-1 text-3xl sm:text-5xl font-cal font-semibold text-indigo-600">
            Organizing Team
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row mt-6 text-gray-800 text-lg">
          <div className="w-full sm:w-1/2 mr-8">
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
                      gridTemplateColumns: "1fr",
                      marginBottom: "0.5rem",
                      marginLeft: "5rem",
                    }}
                  >
                    {name.firstName} {name.lastName}
                  </li>
                ))}
              </ul>
            </div>
            <br />
            This hackathon wouldn&apos;t be possible without the incredible
            support of our universities, our sponsors, volunteers and YOU!
          </div>
          <div className="w-full sm:w-1/2 mt-6 sm:mt-0">
            Feel free to reach out if you have any questions:
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
