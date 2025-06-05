Docker Setup of the OpenWordBible Web Application

1. **Download the repository**
   
2. **Build the docker image***
   ```Bash
      docker build --no-cache -t openwordbible_1.0.0 .
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

Running Application Locally

1. **Requirements**
   Python 3.11.2 is needed to allow tensorflow to install

2. **Create a Python Environment**
   ```Bash
      python -m venv env
   ```

3. **Start Python Environment**
   ```Bash
      env\Scripts\activate
   ```

4. **Install dependencies**
   ```Bash
      pip install -r requirements.txt
   ```

5. **Run Django Application**
   ```Bash
      python manage.py runserver
   ```

6. **Test Application**
   Go to [http://](http://localhost:8000/) location in the browser
 
   



Guidelines for the NER dataset

**Labels**
```bash
   Label Prefix Entity Type     Description                          

   B-/I-art      Artifact         Titles of creative works             
   B-/I-eve      Event            Named events (e.g. "Olympics")       
   B-/I-geo      Geographical     Non-political location (e.g. "Nile") 
   B-/I-gpe      Geo-Political    Countries, cities, etc.              
   B-/I-nat      Natural Object   Natural things (e.g. "Amazon River") 
   B-/I-org      Organization     Corporations, agencies, etc.         
   B-/I-per      Person           People names                         
   B-/I-tim      Time Expression  Dates, times                         
   O             Outside          Not a named entity                   

```
