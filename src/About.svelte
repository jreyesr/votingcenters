<script>
    import correctionsUrl from './data/corrections.json?url'
</script>

<main><h1>Acerca de</h1>

    <p>
        Esta app ha sido desarrollada por <a href="github.com/jreyesr/">jreyesr</a>, después de <i>disfrutar</i> el
        quinto
        cambio de centro electoral de mi vida democrática, siempre más lejos (comenzando a 750m de casa y ahora a > 5
        km).
    </p>

    <p>
        En vista de que el CNE no publica (hasta donde sé) cómo se hace la asignación de todos los votantes del país a
        los
        recintos electorales, esta app intenta visualizar la información publicada de una forma más razonable, esperando
        que
        así se pueda descubrir algo sobre el criterio que usan y si una persona individual puede de alguna forma reducir
        la
        distancia al centro de votación que se le asigne.
    </p>

    <p>
        La mayoría de los datos históricos son <a href="https://www.cne.gob.ec/elecciones-anteriores/">los publicados
        por el
        CNE</a> (solamente disponibles para las elecciones desde 2017 en adelante). Aparte, algunos centros que están
        mal
        georeferenciados han sido <a href={correctionsUrl}>corregidos manualmente</a> por mí. Las
        elecciones de 2017 y 2021 no tienen información geográfica, las ubicaciones que se muestran para esas elecciones
        son
        buscadas en las elecciones que sí tienen ubicaciones, para los recintos que vuelven a aparecer en alguna
        elección
        que sí tiene ubicaciones, y luego los recintos faltantes fueron localizados a mano usando Google Maps +
        OpenStreetMap + Waze.
    </p>
</main>

<style>
    main {
        max-width: 768px;
        margin-inline: auto;
    }
</style>
