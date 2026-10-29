<script>
  import {Router, Link, Route, listen} from "svelte5-router";
  import MapViewer from "./MapViewer.svelte";
  import ReportError from "./ReportError.svelte";
  import Privacy from "./Privacy.svelte";
  import About from "./About.svelte";

  let url = $state("");

  let querystring = $state(document.location.search);
  listen(({location}) => {
    querystring = location.search
  })
  const query = $derived(new URLSearchParams(querystring))
</script>

<Router {url}>
    <div>
        <Route path="/">
            <MapViewer/>
        </Route>
        <Route path="/error">
            <ReportError/>
        </Route>
        <Route path="/about">
            <About/>
        </Route>
        <Route path="/privacy">
            <Privacy/>
        </Route>
    </div>

    <nav class="bottombar">
        Esta página <b>no</b> está asociada con el CNE
        <br>
        <Link to={"/error" + (query.has("election") ? ("?election=" + query.get("election")) : "")}>Reportar un error</Link>
        /
        <Link to="/about">Acerca de</Link>
        /
        <Link to="/privacy">Privacidad</Link>
    </nav>
</Router>

<style>
    nav.bottombar {
        padding: 2em;
        text-align: center;
        /*background-color: */
    }
</style>
