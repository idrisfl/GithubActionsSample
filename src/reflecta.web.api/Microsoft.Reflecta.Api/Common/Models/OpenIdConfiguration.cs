namespace Microsoft.Reflecta.Api.Common.Models
{
    /// <summary>
    /// The OpenIdConfiguration class.
    /// </summary>
    public class OpenIdConfiguration
    {
        /// <summary>
        /// Gets or sets the issuer.
        /// </summary>
        public string Issuer { get; set; }

        /// <summary>
        /// Gets or sets the client id.
        /// </summary>
        public string ClientId { get; set; }

        /// <summary>
        /// Gets or sets the audience.
        /// </summary>
        public string Audience { get; set; }
    }
}
