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

!SLIDE bullets
#fp - lists

!SLIDE bullets
#frp - events

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

!SLIDE
#Mouse cliks

!SLIDE
#Array as Observable

!SLIDE
#that's not a stream

!SLIDE
#stream = [(time, event)]

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
