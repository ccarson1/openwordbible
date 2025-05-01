Docker Setup of the OpenWordBible Web Application

1. **Download the repository**
   
2. **Build the docker image***
   ```Bash
      docker build -t openwordbible_1.0.0 .
   ```
3. **Run the docker image**
   ```Bash
      docker run -p 8000:8000 openwordbible_1.0.0
   ```
4. Note: Rebuilding the docker container will write over the image
   but the container will have to be removed. You can delete the container
   within dockerhub or run:
   ```Bash
      docker ps
      docker stop <container_id>
      docker rm <container_id>
   ```
