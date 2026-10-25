// import { Joystick } from "react-joystick-component";
// import type { IJoystickUpdateEvent } from "react-joystick-component";
// import type { JoystickInput } from "@/types/messages";
// import styles from "./JoystickControl.module.css";

// type JoystickControlProps = {
//   locked: boolean;
//   onDirectionChange: (direction: JoystickInput) => void;
// };

// export default function JoystickControl({
//   locked,
//   onDirectionChange,
// }: JoystickControlProps) {
//   const handleMove = (event: IJoystickUpdateEvent) => {
//     if (locked) {
//       onDirectionChange(null);
//       return;
//     }

//     onDirectionChange(event.direction);
//   };

//   const handleStop = () => {
//     onDirectionChange(null);
//   };

//   return (
//     <div className={`${styles.wrapper} ${locked ? styles.locked : ""}`}>
//       <div className={styles.joystickSurface}>
//         <Joystick
//           size={124}
//           baseColor="rgba(255, 255, 255, 0.10)"
//           stickColor="rgba(255, 255, 255, 0.42)"
//           move={handleMove}
//           stop={handleStop}
//         />
//       </div>
//     </div>
//   );
// }
