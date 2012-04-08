!SLIDE bullets
# frp w/ js #
* juha paananen @raimohanska

!SLIDE code

    tmpvec = new Vector(10)
    for (int i = 0; i < blah; i++) {
        for (int j = foo ; i <= wat; j++) {
            tmpvec.add(new Blurp())
        }
    }

!SLIDE code

    forM_ [1..].filter(isPrime) putStrLn

!SLIDE bullets incremental
#fp - lists
* filter, map, fold, zip, >>=

!SLIDE bullets incremental
#frp - events
* filter, map, scan, merge, combine, >>=

!SLIDE bullets incremental
#RxJs
* microsoft
* free (as in beer)

!SLIDE
#Observable

!SLIDE
#stream-of-events (kinda)

!SLIDE
#.subscribe(callback)

!SLIDE
subscribe :: Observable a -> Observer a -> IO (IO ())

!SLIDE bullets incremental
#Mouse cliks
* $("h1").toObservable("click")

!SLIDE
#stream = [(time, event)]

!SLIDE bullets incremental
#Array as Observable
* Rx.Observable.FromArray([1, 2, 3])

!SLIDE
#that's not a stream

!SLIDE bullets incremental
#bacon.js
* @raimohanska
* open-source

!SLIDE 
#EventStream

!SLIDE
#stream-of-events (really)

!SLIDE
#Property

!SLIDE
#value-as-function-of-time

!SLIDE bullets
* mouseCliks :: EventStream
* mousePos :: Property

!SLIDE
#TODO: UML (obs, es, prop)
