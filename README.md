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
      python -m spacy download en_core_web_sm
   ```

5. **Run Django Application**
   ```Bash
      python manage.py runserver
   ```

6. **Test Application**
   Go to [http://localhost:8000/](http://localhost:8000/) location in the browser
 
   



Guidelines for the NER dataset

**Labels**
***BIO Format Summary***
```bash
   B-XXX: Beginning of entity type XXX
   I-XXX: Inside of the same entity
   O: Outside any named entity
   Entity Labels and Examples
   PER: Person names (e.g., 'Abraham Lincoln' -> B-PER I-PER)
   ORG: Organizations (e.g., 'United States' -> B-ORG I-ORG)
   GPE: Countries, cities, states (e.g., 'New York' -> B-GPE I-GPE)
   LOC: Other locations (e.g., 'Grand Canyon' -> B-LOC I-LOC)
   GEO: Natural features (e.g., 'Nile River' -> B-GEO I-GEO)
   TIM: Time expressions (e.g., 'August 15, 1947' -> B-TIM I-TIM O I-TIM, A.D. -> B-TIM O I-TIM O)
   NAT: Natural entities (e.g., 'COVID-19', 'Hurricane Ian' -> B-NAT)
   EVE: Named events (e.g., 'World War II' -> B-EVE I-EVE I-EVE)
   ART: Artworks (e.g., 'Starry Night' -> B-ART I-ART)
   MISC: Miscellaneous named items (e.g., 'Western culture' -> B-MISC I-MISC)
```
**Common Mistakes**
```bash
   
   - Do not mix entity types in one phrase (e.g., B-PER I-ORG is incorrect)
   - Always start an entity with B-XXX
   - Label punctuation as O unless it is part of the named entity
   - Use B-XXX for new entity mentions even if same type
```
***LOC vs GEO***
```bash
   Entity	Tag	Why
   Grand Canyon	LOC	Often treated as a tourist destination or landmark
   Mississippi River	GEO	A natural river — not man-made
   5th Avenue	LOC	A street — man-made, not a natural feature
   Sahara Desert	GEO	A natural desert
   Central Park	LOC	Designed by humans — a city park
   Himalayas	GEO	Mountain range — natural formation
```
***B-TIM, I-TIM***
```bash
   3 → B-TIM  
   : → O  
   15 → I-TIM

   A → B-TIM  
   . → O  
   D → I-TIM
   . → O  
```
***Explicit dates***
```bash
   January 5th	B-TIM I-TIM
   03/17/2022	B-TIM
   the 14th of July	B-TIM I-TIM I-TIM
```

***Specific Times of Day***
```bash
   3:45 PM	B-TIM O I-TIM
   at noon	B-TIM I-TIM
   12 o'clock	B-TIM I-TIM
```

***Date + Time Combinations***
```bash
   January 1st, 2023 at 4 PM	B-TIM I-TIM O I-TIM I-TIM I-TIM I-TIM
```

***Relative Time Expressions***
```bash
   yesterday	B-TIM
   last week	B-TIM I-TIM
   two days ago	B-TIM I-TIM I-TIM
   next year	B-TIM I-TIM
   in 5 minutes	B-TIM I-TIM I-TIM
```

***Durations***
```bash
   for three hours	B-TIM I-TIM I-TIM
   about 10 minutes	B-TIM I-TIM I-TIM
```

***Time Ranges***
```bash
   from 10am to 2pm	B-TIM I-TIM I-TIM I-TIM
   between Monday and Friday	B-TIM I-TIM I-TIM I-TIM
```
```bash
   NER Label Set for Prodigy / Doccano
   Prodigy:
   {
   "labels": ["PER", "ORG", "GPE", "LOC", "GEO", "TIM", "NAT", "EVE", "ART", "MISC"]
   }
   Doccano YAML:
   - [PER, Person]
   - [ORG, Organization]
   - [GPE, Geo-political Entity]
   - [LOC, Other Location]
   - [GEO, Geographical Feature]
   - [TIM, Time Expression]
   - [NAT, Natural Entity]
   - [EVE, Event]
   - [ART, Artwork]
   - [MISC, Miscellaneous]               

```


