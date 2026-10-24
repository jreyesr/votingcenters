<script>
  import {Router, Link, Route} from "svelte5-router";
  import MapViewer from "./MapViewer.svelte";
  import ReportError from "./ReportError.svelte";
  import Privacy from "./Privacy.svelte";
  import About from "./About.svelte";

  let url = $state("");
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
        <Link to="/error">Reportar un error</Link>
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
