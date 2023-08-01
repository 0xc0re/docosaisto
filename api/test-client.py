import requests
import threading
import argparse
import itertools

def send_request(text, index, request_type, extension):
    endpoint = f'http://sbaitso.merle.io/generate/{request_type}'
    try:
        response = requests.post(endpoint, json={'text': text})
        if response.status_code == 200:
            with open(f'output_{index}.{extension}', 'wb') as file:
                file.write(response.content)
            print(f"Saved output_{index}.{extension}")
        else:
            print(f"Request {index} failed with status code {response.status_code}: {response.text}")
    except Exception as e:
        print(f"An error occurred for request {index}: {e}")

def main():
    parser = argparse.ArgumentParser(description="Send simultaneous requests to test the service.")
    parser.add_argument('type', choices=['audio', 'video'], help="Request type ('audio' or 'video').")
    parser.add_argument('-c', '--count', type=int, default=1, help="Total number of requests to send.")
    parser.add_argument('-s', '--simultaneous', type=int, default=1, help="Number of simultaneous requests.")
    parser.add_argument('text', help="Text to send in the request.")
    args = parser.parse_args()

    request_type = args.type
    extension = 'mp3' if request_type == 'audio' else 'mp4'
    text = args.text

    index_counter = itertools.count()  # Infinite counter for file indices

    for _ in range(args.count // args.simultaneous):
        threads = []
        for _ in range(args.simultaneous):
            index = next(index_counter)
            thread = threading.Thread(target=send_request, args=(text, index, request_type, extension))
            thread.start()
            threads.append(thread)

        for thread in threads:
            thread.join()

    print("All requests completed.")

if __name__ == "__main__":
    main()
