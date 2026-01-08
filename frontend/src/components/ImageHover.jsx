// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { ZoomIn, ZoomOut, RotateCw, X, Maximize2 } from "lucide-react"; // Install lucide-react or use SVGs

// export default function MenuImageHover({ src, name = "Menu Item" }) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [zoom, setZoom] = useState(1);
//   const [rotation, setRotation] = useState(0);

//   const resetTransform = () => {
//     setZoom(1);
//     setRotation(0);
//   };

//   return (
//     <td className="border px-4 py-1">
//       {src ? (
//         <>
//           <div
//             onClick={() => setIsOpen(true)}
//             className="group relative w-7 h-7 rounded border border-gray-200 overflow-hidden cursor-pointer transition-all hover:ring-1 hover:ring-amber-500 shadow-sm"
//           >
//             <img
//               src={src}
//               className="w-full h-full object-cover transition-transform group-hover:scale-110"
//               alt={name}
//             />
//             <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
//               <Maximize2 className="w-4 h-4 text-white" />
//             </div>
//           </div>

//           <AnimatePresence>
//             {isOpen && (
//               <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">

//                 <motion.div
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   exit={{ opacity: 0 }}
//                   onClick={() => setIsOpen(false)}
//                   className="absolute inset-0 bg-black/40 backdrop-blur-sm"
//                 />


//                 <motion.div
//                   initial={{ scale: 0.9, opacity: 0 }}
//                   animate={{ scale: 1, opacity: 1 }}
//                   exit={{ scale: 0.9, opacity: 0 }}
//                   className="relative bg-amber-100 rounded shadow-2xl overflow-hidden w-full max-w-2xl flex flex-col"
//                 >

//                   <div className=" border-b flex items-center justify-between p-2 bg-amber-100">
//                     <div>
//                       <h3 className="text-sm font-bold text-gray-900">
//                         {name}
//                       </h3>
//                       <p className="text-xs text-gray-500">Preview Mode</p>
//                     </div>
//                     <button
//                       onClick={() => setIsOpen(false)}
//                       className="p-1 hover:text-red-500 transition-colors"
//                     >
//                       <X className="w-5 h-5" />
//                     </button>
//                   </div>

//                   <div className="relative h-[300px] w-full bg-gray-50 overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing">
//                     <motion.img
//                       animate={{ scale: zoom, rotate: rotation }}
//                       transition={{
//                         type: "spring",
//                         stiffness: 300,
//                         damping: 30,
//                       }}
//                       src={src}
//                       className="max-h-full max-w-full object-contain shadow-lg"
//                     />
//                   </div>

//                   <div className=" bg-amber-100 flex items-center justify-center gap-9">
//                     <div className="flex items-center gap-2  px-4 py-2 ">
//                       <button
//                         onClick={() =>
//                           setZoom((prev) => Math.max(prev - 0.5, 0.5))
//                         }
//                         className="p-1 hover:text-amber-700 transition-colors"
//                         title="Zoom Out"
//                       >
//                         <ZoomOut className="w-5 h-5" />
//                       </button>
//                       <span className="text-xs font-mono w-12 text-center">
//                         {Math.round(zoom * 100)}%
//                       </span>
//                       <button
//                         onClick={() =>
//                           setZoom((prev) => Math.min(prev + 0.5, 3))
//                         }
//                         className="p-1 hover:text-amber-700 transition-colors"
//                         title="Zoom In"
//                       >
//                         <ZoomIn className="w-5 h-5" />
//                       </button>
//                     </div>

//                     <button
//                       onClick={() => setRotation((prev) => prev + 90)}
//                       className="flex items-center gap-2 px-4 hover:text-amber-700  transition-all"
//                     >
//                       <RotateCw className="w-5 h-5" />
//                       <span className="text-xs font-medium">Rotate</span>
//                     </button>

//                     <button
//                       onClick={resetTransform}
//                       className="text-xs text-gray-600 hover:text-gray-700 hover:underline"
//                     >
//                       Reset
//                     </button>
//                   </div>
//                 </motion.div>
//               </div>
//             )}
//           </AnimatePresence>
//         </>
//       ) : (
//         <span className="text-xs text-gray-400 italic">No Image</span>
//       )}
//     </td>
//   );
// }


import React from 'react';
import { Image } from 'antd';
const MenuImageHover = ({ src, name = "Menu Item" }) => (
  <Image
  src={src}
  alt={name || 'Item image'}
  width={25}
  height={25}
  className="rounded object-cover items-center justify-center transition-transform duration-200 hover:scale-105"
/>


  
);
export default MenuImageHover;