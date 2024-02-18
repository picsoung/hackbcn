export default function Footer({ padding = false }) {
  return (
    <footer>
      <div
        className={`mx-auto max-w-7xl ${
          padding ? "px-6 lg:px-8" : ""
        } py-12 md:flex md:items-center md:justify-between`}
      >
        <div className="mt-8 md:order-1 md:mt-0">
          <p className="text-center text-xs leading-5 text-white">
            &copy; 2024. Brought to you from NYC with{" "}
            <span style={{ color: "red" }}>&#x2764;</span>
            <span style={{ color: "red" }}>&#x2764;</span>
            <span style={{ color: "red" }}>&#x2764;</span> from <b>Columbia</b>{" "}
            x <b>Cornell</b> x <b>NYU</b>.
          </p>
        </div>
      </div>
    </footer>
  );
}
