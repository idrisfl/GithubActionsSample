ARG SCRIPT_NAME

# Use Python Alpine image
FROM python:3.11-alpine
ARG SCRIPT_NAME

# Set shell to be used
SHELL ["sh", "-c"]

# Set the working directory inside the container
WORKDIR /app

# Add the gcc and other necessary packages
RUN apk update && apk add --no-cache build-base gcc && rm -rf /var/cache/apk/*

# Copy project files
COPY . /app

# Install dependencies
ENV SCRIPT_NAME $SCRIPT_NAME

RUN pip install --no-cache-dir -r requirements.txt
RUN echo "Running the script ${SCRIPT_NAME}.py"
RUN ls -l
CMD python ./${SCRIPT_NAME}.py