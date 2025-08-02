import { useContext } from "react";
import { AppContent } from "../context/AppContext";

export const Header = () => {
  const { userData } = useContext(AppContent);

  return (
    <div className=" mt-20 px-4 text-center text-gray-800">
      <div className="flex flex-col">
        <h1 className=" items-center gap-2 text-xl sm:text-3xl font-medium mb-2">
          Hey {userData ? userData.firstName : "Developer"}! 🖐
        </h1>
        <h2 className="text-3xl sm:text-5xl font-semibold mb-4">
          Welcome to our App
        </h2>
        <p className="mb-8 max-w-md text-center mx-auto">
          Let's start with a quick product tour and we will have you up and
          running in no time!
        </p>
        <div>
          <button className="border border-gray-500 rounded-full px-8  py-2.5 hover:bg-gray-200 transition-all">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};
