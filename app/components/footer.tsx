export default function Footer({ padding = false }) {
  return (
    <footer className="">
      <div
        className={`mx-auto max-w-7xl ${
          padding ? "px-6 lg:px-8" : ""
        } py-12 md:flex md:items-center md:justify-between`}
      >
        <div className="mt-8 md:order-1 md:mt-0">
          <p className="text-center text-xs leading-5 text-white">
            &copy; 2024. From NYC with &hearts; by
            {" Andrew, Jan, Iris and Sudhanshu"}
          </p>
        </div>
      </div>
    </footer>
  );
}
