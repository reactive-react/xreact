lazy val docs = (project in file("./docs"))
  .enablePlugins(MicrositesPlugin)
  .settings(
    micrositeName := "xReact",
    micrositeDescription := "Reactive x React = xReact",
    micrositeAuthor := "Jichao Ouyang",
    micrositeHomepage := "https://xreact.oyanglul.us/",
    micrositeOrganizationHomepage := "https://oyanglul.us",
    micrositeTwitter := "@oyanglulu",
    micrositeGithubOwner := "reactive-react",
    micrositeGithubRepo := "xreact",
    micrositeDocumentationUrl := "/Get-Started.html",
    micrositeGitterChannel := true,
    micrositeGitterChannelUrl := "jcouyang/react-most"
)
