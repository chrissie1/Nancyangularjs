using System;

namespace NancyAngularjs.Models
{
    public class PlantModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Genus { get; set; }
        public string Species { get; set; }
        public DateTime DateAdded { get; set; }
    }
}