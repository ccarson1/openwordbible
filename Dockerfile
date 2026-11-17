# Base image: Ubuntu
FROM ubuntu:22.04

# Avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && \
    apt-get install -y python3 python3-venv python3-pip && \
    apt-get clean

# Set working directory
WORKDIR /app

# Create virtual environment
RUN python3 -m venv venv

# Install requirements first so they are cached between builds
COPY requirements.txt .
RUN . venv/bin/activate && pip install --upgrade pip && pip install -r requirements.txt

# Copy the local project into the image
COPY . .

# The container is reached from outside, so allow any host by default
ENV DJANGO_ALLOWED_HOSTS=*

# Expose port 8000
EXPOSE 8000

# Apply migrations and run the Django server
CMD ["/bin/bash", "-c", ". venv/bin/activate && python3 manage.py migrate && python3 manage.py runserver 0.0.0.0:8000"]
