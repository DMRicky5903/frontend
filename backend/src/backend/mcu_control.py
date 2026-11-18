import serial
import serial.tools.list_ports
import json
import time
import threading
from datetime import datetime

import cv2
import numpy as np

# -----------------------------------------------------
# 模式設定
# -----------------------------------------------------
# True：没有 Pico 时也允许运行，只打开镜头。
# False：找不到 Pico 时直接报错。
ALLOW_CAMERA_ONLY = True

CAMERA_INDEX = 0
CAMERA_WIDTH = 640
CAMERA_HEIGHT = 480

# -----------------------------------------------------
# Serial 設定
# -----------------------------------------------------
BAUD_RATE = 115200

MOVE_DURATION_MS = 500
OLED_MESSAGE = "你好Hello"

gimbal1_position = 1500
gimbal2_position = 1500

GIMBAL_MIN = 1200
GIMBAL_MAX = 1800
GIMBAL_STEP = 100


class MockSerial:
    def write(self, data):
        print("MOCK SEND:", data.decode("utf-8").strip())

    def close(self):
        print("Mock serial closed.")


def find_pico_port():
    ports = serial.tools.list_ports.comports()

    for port in ports:
        if "usbmodem" in port.device.lower():
            return port.device

    return None


def open_serial():
    port = find_pico_port()

    if port is None:
        if ALLOW_CAMERA_ONLY:
            print("No Pico found. Starting camera-only mode.")
            return None

        raise RuntimeError(
            "找不到 Pico 串口。\n"
            "请连接 Pico，或将 ALLOW_CAMERA_ONLY 设为 True。"
        )

    try:
        ser = serial.Serial(port, BAUD_RATE)
        print(f"Connected to Pico: {port}")
        return ser

    except serial.SerialException as error:
        if ALLOW_CAMERA_ONLY:
            print(f"Could not open Pico serial port: {error}")
            print("Starting camera-only mode.")
            return None

        raise


ser = open_serial()

# 如果没有连接 Pico，使用 MockSerial，避免程式崩溃。
if ser is None:
    ser = MockSerial()


def send(command: dict):
    text = json.dumps(command) + "\n"
    ser.write(text.encode("utf-8"))
    print("Sent:", text.strip())


def send_current_time():
    now = datetime.now()

    send({
        "cmd": "Time.begin",
        "year": now.year,
        "month": now.month,
        "day": now.day,
        "weekday": now.weekday(),
        "hour": now.hour,
        "minute": now.minute,
        "second": now.second
    })


def time_sync_loop():
    while True:
        send_current_time()
        time.sleep(60)


def move_wheels(action: str):
    send({
        "cmd": f"wheels.{action}",
        "durationMs": MOVE_DURATION_MS
    })


def move_gimbal(motor: int, delta: int):
    global gimbal1_position, gimbal2_position

    if motor == 1:
        gimbal1_position += delta

        gimbal1_position = max(
            GIMBAL_MIN,
            min(GIMBAL_MAX, gimbal1_position)
        )

        send({
            "cmd": "gimbal1.moveTo",
            "position": gimbal1_position
        })

    elif motor == 2:
        gimbal2_position += delta

        gimbal2_position = max(
            GIMBAL_MIN,
            min(GIMBAL_MAX, gimbal2_position)
        )

        send({
            "cmd": "gimbal2.moveTo",
            "position": gimbal2_position
        })


def send_oled_message():
    send({
        "cmd": "OledDisplay.showMessage",
        "message": OLED_MESSAGE
    })


def draw_control_ui(frame):
    height, width = frame.shape[:2]

    overlay = frame.copy()

    cv2.rectangle(
        overlay,
        (10, 10),
        (360, 250),
        (0, 0, 0),
        -1
    )

    cv2.addWeighted(
        overlay,
        0.6,
        frame,
        0.4,
        0,
        frame
    )

    cv2.putText(
        frame,
        "PICO CAMERA CONTROL",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (255, 255, 255),
        2
    )

    cv2.putText(
        frame,
        "W / S : Forward / Backward",
        (20, 80),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.5,
        (255, 255, 255),
        1
    )

    cv2.putText(
        frame,
        "A / D : Left / Right",
        (20, 105),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.5,
        (255, 255, 255),
        1
    )

    cv2.putText(
        frame,
        "J / L : Gimbal 1 +100 / -100",
        (20, 130),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.5,
        (255, 255, 255),
        1
    )

    cv2.putText(
        frame,
        "I / K : Gimbal 2 +100 / -100",
        (20, 155),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.5,
        (255, 255, 255),
        1
    )

    cv2.putText(
        frame,
        "SPACE : OLED message",
        (20, 180),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.5,
        (255, 255, 255),
        1
    )

    cv2.putText(
        frame,
        "ESC : Quit",
        (20, 205),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.5,
        (255, 255, 255),
        1
    )

    cv2.putText(
        frame,
        f"Gimbal 1: {gimbal1_position}",
        (20, 230),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.5,
        (0, 255, 0),
        1
    )

    cv2.putText(
        frame,
        f"Gimbal 2: {gimbal2_position}",
        (20, 250),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.5,
        (0, 255, 0),
        1
    )

    return frame


def main():
    print("OpenCV Pico control started.")

    if not isinstance(ser, MockSerial):
        send_current_time()

        time_thread = threading.Thread(
            target=time_sync_loop,
            daemon=True
        )
        time_thread.start()

    camera = cv2.VideoCapture(CAMERA_INDEX)

    if not camera.isOpened():
        print("Cannot open camera.")
        return

    camera.set(cv2.CAP_PROP_FRAME_WIDTH, CAMERA_WIDTH)
    camera.set(cv2.CAP_PROP_FRAME_HEIGHT, CAMERA_HEIGHT)

    print("Camera started. Click the camera window, then use the keyboard.")

    while True:
        success, frame = camera.read()

        if not success:
            print("Failed to read camera frame.")
            break

        frame = draw_control_ui(frame)

        cv2.imshow("Pico Camera Control", frame)

        key = cv2.waitKey(30) & 0xFF

        # ESC：結束。
        if key == 27:
            if not isinstance(ser, MockSerial):
                send({
                    "cmd": "wheels.stop"
                })

            break

        # W：前進。
        elif key == ord("w"):
            move_wheels("forward")

        # A：左轉。
        elif key == ord("a"):
            move_wheels("turnLeft")

        # S：後退。
        elif key == ord("s"):
            move_wheels("backward")

        # D：右轉。
        elif key == ord("d"):
            move_wheels("turnRight")

        # J：Gimbal 1 正方向。
        elif key == ord("j"):
            move_gimbal(1, GIMBAL_STEP)

        # L：Gimbal 1 負方向。
        elif key == ord("l"):
            move_gimbal(1, -GIMBAL_STEP)

        # I：Gimbal 2 正方向。
        elif key == ord("i"):
            move_gimbal(2, GIMBAL_STEP)

        # K：Gimbal 2 負方向。
        elif key == ord("k"):
            move_gimbal(2, -GIMBAL_STEP)

        # Space：送出 OLED 文字。
        elif key == ord(" "):
            send_oled_message()

    camera.release()

    if not isinstance(ser, MockSerial):
        ser.close()

    cv2.destroyAllWindows()

    print("Finished.")


if __name__ == "__main__":
    main()
