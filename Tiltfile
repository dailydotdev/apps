def include_if_exists(path):
  if os.path.exists(path):
    print("including %s", path)
    include(path)
  else:
    print("skipping %s because it does not exist", path)

include_if_exists('../daily-api/Tiltfile')
include_if_exists('../adhoc-infra/Tiltfile')
include_if_exists('../heimdall/Tiltfile')
include_if_exists('../post-scraper-one-ai/Tiltfile')
include_if_exists('../njord/Tiltfile')
include_if_exists('../freyja/Tiltfile')
#include_if_exists('../skadi/Tiltfile')
