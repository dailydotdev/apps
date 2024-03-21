load('ext://uibutton', 'cmd_button', 'location')

include('../daily-api/Tiltfile')
include('../heimdall/Tiltfile')
include('../post-scraper-one-ai/Tiltfile')

def get_daily_dir(app=""):
  parent = os.path.dirname(os.getcwd())
  return os.path.join(parent, app)

# Add a button to API to seed the database
cmd_button(
  name="db_seed",
  resource="api",
  text="Seed Database",
  icon_name="repartition",
  requires_confirmation=True,
  dir=get_daily_dir("daily-api"),
  argv=["npm", "run", "db:seed:import"],
)

# Add a button to API to run db migrations
cmd_button(
  name="db_migrate",
  resource="api",
  text="Run database migrations",
  icon_name="dns",
  requires_confirmation=True,
  dir=get_daily_dir("daily-api"),
  argv=["npm", "run", "db:migrate:latest"],
)

# Add a button to API to run db rollback
cmd_button(
  name="db_rollback",
  resource="api",
  text="Run database rollback",
  icon_name="settings_backup_restore",
  requires_confirmation=True,
  dir=get_daily_dir("daily-api"),
  argv=["npm", "run", "db:migrate:rollback"],
)

# Add a button to navbar to trigger pubsub fix
cmd_button(
  name="fix_pubsub",
  text="Fix pubsub",
  location=location.NAV,
  icon_name="tips_and_updates",
  requires_confirmation=True,
  dir=get_daily_dir("adhoc-infra"),
  argv=["./adhoc.sh", "fix_pubsub"],
)
