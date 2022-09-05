import functions_framework


# https://github.com/GoogleCloudPlatform/functions-framework-python#quickstart-pubsub-emulator
# https://cloud.google.com/pubsub/docs/publisher#python
# https://github.com/GoogleCloudPlatform/functions-framework-python
# https://github.com/googleapis/python-pubsub/blob/0fa3d40bd17f6b9271c4bf0700867c0199be0da3/samples/snippets/schema.py#L255

@functions_framework.cloud_event
def hello_cloud_event(cloud_event):
    print(f"Received event with ID: {cloud_event['id']} and data {cloud_event.data}")
