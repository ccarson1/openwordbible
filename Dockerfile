# Base image: Ubuntu
FROM ubuntu:22.04

# Avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && \
    apt-get install -y python3 python3-venv python3-pip git && \
    apt-get clean

# Set working directory
WORKDIR /app

# Clone the GitHub repo
RUN git clone https://github.com/ccarson1/openwordbible.git .

# Create virtual environment
RUN python3 -m venv venv

# Activate virtual environment and install requirements
RUN . venv/bin/activate && pip install --upgrade pip && pip install -r requirements.txt

#Download words for spacy to use
RUN python -m spacy download en_core_web_sm

# Expose port 8000
EXPOSE 8000

# Run the Django server
CMD ["/bin/bash", "-c", ". venv/bin/activate && python3 manage.py runserver 0.0.0.0:8000"]

