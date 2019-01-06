interface IAnalytics {
  queue?: Event[]
  track?: (event: string, properties?: object) => any
  identify?: (userId: string, properties?: object) => any
  __analytics?: IAnalytics
}

type Event = {
  [0]: string // "track"
  [1]: string // "Form Submitted"
  [2]: object // { email, name, dob }
}

type Options = {
  analytics?: IAnalytics
  remote?: RemoteOptions
  local?: LocalOptions
}

type LocalOptions = {
  env?: boolean
  encrypt?: (batch: Event[]) => Promise<Event[]>
  decrypt?: (batch: Event[]) => Promise<Event[]>
}

type RemoteOptions = {
  env?: boolean
  encrypt?: (batch: Event[]) => Promise<Event[]>
  decrypt?: (batch: Event[]) => Promise<Event[]>
}

const fakeAnalytics = () => ({
  queue: [],
  track(...item: any[]) {
    this.queue.push(['track', ...item])
  },
  identify(...item: any[]) {
    this.queue.push(['identify', ...item])
  }
})

function wrap(opts: Options, analytics: IAnalytics) {
  return {
    track: async (...args: [string, object]) => {
      if (!opts.local) return analytics.track.apply(analytics, args)

      let encryptedArgs = await opts.local.encrypt([
        ['track', args[0], args[1]]
      ])

      analytics.track.apply(analytics, [
        encryptedArgs[0][1],
        encryptedArgs[0][2]
      ])
    },
    identify: async (...args: any[]) => {
      if (!opts.local) analytics.identify.apply(analytics, args)

      let encryptedArgs = await opts.local.encrypt([
        ['identify', args[0], args[1]]
      ])

      analytics.identify.apply(analytics, [
        encryptedArgs[0][1],
        encryptedArgs[0][2]
      ])
    }
  }
}

function analyticsEncryption(opts?: Options) {
  if (!opts) opts = {}

  let _analytics: IAnalytics

  if (opts.analytics) {
    _analytics = opts.analytics
  } else {
    if (typeof window !== 'undefined') {
      if (typeof window['analytics'] !== 'undefined') {
        _analytics = window['analytics']
      }
    } else {
      _analytics = { ...fakeAnalytics() }
    }
  }

  let encryptedAnalytics: IAnalytics = wrap(opts, _analytics)

  encryptedAnalytics.__analytics = _analytics

  return encryptedAnalytics
}

export default analyticsEncryption
