<table align="center">
  <tr>
    <td><img src="https://github.com/0xc0re/docosaisto/assets/7865591/a6af4bda-6ed2-4854-9b6e-4d788cb4304c" alt="docosaisto" height="400"></td>
  </tr>
</table>

# README.md for docosaisto

## Overview

`docosaisto` is a Node.js-based API and static HTML site designed to run the MS-DOS <a href="https://en.wikipedia.org/wiki/Dr._Sbaitso">Dr. Sbaitso</a> application and return an MP3 of the audio. 

## Project Structure

- `api`: Contains the main API code and resources.
  - `package-lock.json`, `package.json`: Node.js dependencies and configuration.
  - `Dockerfile`: Defines the Docker image for the API.
  - `start.sh`: Script to start the API server.
  - `public`: Directory for static files.
  - `generate.js`: Code related to generating audio (and maybe video?)
  - `sbaitso`: Contains executables and resources related to DR. SBAITSO.
  - `test-client.py`: Testing script for the API client.
  - `server.js`: Main server file for the Node.js API.
- `docker-compose.yml`: Docker Compose file for defining and running multi-container Docker applications.


## Getting Started

### Prerequisites

- Docker
- Node.js

### Installation

1. Clone the repository.
2. Navigate to the project directory.
3. Run `docker-compose up` to start the Docker containers.
4. Access the API at the specified endpoint.


## To Do

  - Virtual sinks for every request. Currently, unless we set the default sink -- we get no audio.


## Contributing

Submit something.
