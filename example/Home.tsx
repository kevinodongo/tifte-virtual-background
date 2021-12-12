import * as React from "react";

const navigation = [
  { title: "Chime meeting", href: "/meeting-session" },
  { title: "AI Face Detection", href: "/rekognition-identity-verification" },
  { title: "AI Meeting Session Analysis", href: "/rekognition-session-analysis" },
]

function Home() {
  return (
    <div className="bg-gray-900 h-screen overflow-hidden flex items-center justify-center">
      <div className="max-w-sm mx-auto text-white">
        <h1 className="uppercase text-xl font-bold">Uniteroom SDK PlayGroud Testing</h1>
        <div className="text-base text-gray-400 mt-2">This playground will be used to test the Uniteroom SDK and ensure it works accordingly. We are going to test the following:</div>
        <ul className="mt-2 flex flex-col">
          {navigation.map((item, index) => (
            <li key={index} >
              <a href={item.href} className="flex items-center hover:bg-gray-600 p-2 rounded-md cursor-pointer justify-between">
                <span>{item.title}</span> <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Home