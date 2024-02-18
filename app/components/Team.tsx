export default function Team() {
  return (
    <div id="about" className="bg-orange-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="mt-2 text-3xl font-cal text-orange-900 sm:text-5xl">
            About
          </h2>
        </div>
        <div className="flex mt-6 text-gray-700">
          <div className="w-1/2 mr-8">
            IvyHacks is brought to you by Andrew Siah, Jan Carbonell, Iris Meng,
            and Sudhanshu Pandey.
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
